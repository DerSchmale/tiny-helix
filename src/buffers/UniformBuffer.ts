import {WebGPUContext} from "../WebGPUContext";
import {Buffer, BufferBuilder} from "./Buffer";
import {float32ToFloat16} from "../utils/float32ToFloat16";
import {IBuffer} from "./IBuffer";
import {IndexedCollection} from "../utils/IndexedCollection";

/**
 * Primitive base types supported by the uniform buffer helpers.
 * These correspond to WGSL scalar types used inside UBOs.
 */
export enum BaseType {
    Float16,
    Float32,
    Uint,
    Sint,
    Boolean
}

function sizeForBaseType(type: BaseType): number {
    switch (type) {
        case BaseType.Float16:
            return 2;
        case BaseType.Float32:
            return 4;
        case BaseType.Boolean:
            return 1;
        default:
            throw new Error("Unknown BaseType.");
    }
}

enum ContainerType {
    Scalar,
    Vec,
    Matrix,    // a matrix of 2 vec[numElements]<baseType>
    Array,
}

class MemberType {
    baseType: BaseType;
    containerType: ContainerType;
    numRows = 1;
    numCols = 1;

    constructor(baseType: BaseType, containerType: ContainerType, numRows: number, numCols: number) {
        if (containerType === ContainerType.Scalar && numRows !== 1 && numCols !== 1) {
            throw new Error("Scalar member must have numRows = 1.");
        }

        this.baseType = baseType;
        this.containerType = containerType;
        this.numRows = numRows;
        this.numCols = numCols;
    }

    get size(): number {
        // when we're dealing with matrices, storing vec3f internally stores as vec4f
        const numRows = this.numCols > 1 && this.numRows === 3 ? 4 : this.numRows;
        return sizeForBaseType(this.baseType) * numRows * this.numCols;
    }

    get alignment(): number {
        const numElements = this.numRows === 3 ? 4 : this.numRows;
        // matrices are also just aligned to their underlying vec alignment
        return sizeForBaseType(this.baseType) * numElements;
    }
}

interface Member {
    type: MemberType;
    offset: number;
}

export class UniformBufferLayoutBuilder {
    private _size: number = 0;
    private _members: Map<string, Member> = new Map();

    /**
     * Reserve an explicit size for the resulting UBO layout. If not set the
     * builder will compute a size that fits all declared members.
     */
    withSize(size: number): this {
        if (this._size !== 0) throw new Error("Size already set.");
        this._size = size;
        return this;
    }

    pushScalar(baseType: BaseType, name: string): this {
        return this._pushField(baseType, name, ContainerType.Scalar);
    }

    pushVec2(baseType: BaseType, name: string): this {
        return this._pushField(baseType, name, ContainerType.Vec, 2);
    }

    pushVec3(baseType: BaseType, name: string): this {
        return this._pushField(baseType, name, ContainerType.Vec, 3);
    }

    pushVec4(baseType: BaseType, name: string): this {
        return this._pushField(baseType, name, ContainerType.Vec, 4);
    }

    pushMatrix(baseType: BaseType, numRows: number, numCols: number, name: string): this {
        if (!Number.isInteger(numRows) || !Number.isInteger(numCols)) {
            throw new Error('Matrix dimensions must be integers');
        }

        if (numRows < 2 || numRows > 4 || numCols < 2 || numCols > 4) {
            throw new Error('Matrix dimensions must be between 2 and 4 (inclusive)');
        }

        return this._pushField(baseType, name, ContainerType.Matrix, numRows, numCols);
    }

    /**
     * Finalize and return a `UniformBufferLayout` describing member offsets and total size.
     */
    build(): UniformBufferLayout {
        // round up to 16 byte alignment with a 16 byte minimum
        this._size = Math.ceil(this._size / 16) * 16;
        return new UniformBufferLayout(this._size, this._members);
    }

    private _pushField(baseType: BaseType, name: string, containerType: ContainerType, numRows: number = 1, numCols: number = 1): this {
        const type = new MemberType(baseType, containerType, numRows, numCols);
        const alignment = type.alignment;
        const offset = Math.ceil(this._size / alignment) * alignment;
        this._members.set(name, {offset, type});
        this._size = offset + type.size;
        return this;
    }
}

/**
 * Describes the layout of a uniform buffer including member offsets and total size.
 * Use `UniformBufferLayoutBuilder` to construct instances.
 */
export class UniformBufferLayout {
    readonly size: number;
    private _members: Map<string, Member>;

    constructor(size: number, members: Map<string, Member>) {
        this.size = size;
        this._members = members;
    }

    /**
     * Create typed DataViews for each member of the layout.
     * @internal
     */
    _createDataViews(target: ArrayBuffer): Map<string, [Member, IndexedCollection]> {
        const map = new Map();
        for (const [name, member] of this._members) {
            let ArrayConst: { new(buffer: ArrayBuffer, byteOffset: number, size: number): IndexedCollection; };
            const size = member.type.size;
            let byteSize = 4;

            switch (member.type.baseType) {
                case BaseType.Float16:
                    byteSize = 2;
                    ArrayConst = Uint16Array;
                    break;
                case BaseType.Float32:
                    ArrayConst = Float32Array;
                    break;
                case BaseType.Uint:
                case BaseType.Boolean:
                    ArrayConst = Uint32Array;
                    break;
                case BaseType.Sint:
                    ArrayConst = Int32Array;
                    break;
            }

            map.set(name, [ member, new ArrayConst(target, member.offset, size / byteSize) ]);
        }
        return map;
    }

    private _getMemberOrThrow(name: string): Member {
        const member = this._members.get(name);
        if (!member) {
            throw new Error(`Member ${name} not found in layout.`);
        }
        return member;
    }
}

/**
 * GPU-backed uniform buffer wrapper providing typed setters and an upload method.
 * Use {@link TinyHelix.createUniformBuffer} to create instances.
 */
export class UniformBuffer implements IBuffer {
    private _buffer: Buffer;
    private _data: ArrayBuffer;
    private _ctx: WebGPUContext;
    private _dataViews: Map<string, [Member, IndexedCollection]> = new Map();

    /**
     * Create a new UniformBuffer with the given layout and WebGPU context.
     * @internal
     */
    constructor(layout: UniformBufferLayout, ctx: WebGPUContext) {
        const data = new ArrayBuffer(layout.size);
        this._buffer = new BufferBuilder(ctx)
            .withUsage(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST)
            .withData(data, true)
            .build();
        this._data = this._buffer.data!;
        this._dataViews = layout._createDataViews(this._data);

        // hmmm let's think a bit here.
        // We could go through all the members of the layout and create typed views for them, so we don't need all the
        // _write functions upstairs
        this._ctx = ctx;
    }

    /**
     * Sets the value of a scalar field.
     * @param name Name of the scalar field.
     * @param value Value to set.
     */
    setScalar(name: string, value: number): this {
        const [ member, target ] = this._dataViews.get(name)!;

        if (member.type.baseType === BaseType.Float16) {
            target[0] = float32ToFloat16(value);
        }
        else {
            target[0] = value;
        }

        return this;
    }

    /**
     * Sets the values for a vector field.
     * @param name Name of the vector field.
     * @param values Array of values to set.
     */
    setVec(name: string, values: number[] | IndexedCollection): this {
        const [ member, target ] = this._dataViews.get(name)!;

        if (member.type.baseType == BaseType.Float16) {
            for (let i = 0; i < values.length; ++i) {
                target[i] = float32ToFloat16(values[i]);
            }
        } else {
            for (let i = 0; i < values.length; ++i) {
                target[i] = values[i];
            }
        }

        return this;
    }

    /**
     * Sets the values for a matrix field.
     * @param name Name of the matrix field.
     * @param values Array of values to set. The values are expected to be in column-major order.
     */
    setMatrix(name: string, values: number[] | IndexedCollection): this {
        const [ member, target ] = this._dataViews.get(name)!;

        const numCols = member.type.numCols;
        const numRows = member.type.numRows;
        const skipW = numRows === 3;

        // I know looping inside the cases looks ugly and the loops are tiny, but I just can't bring myself to put
        // a switch in a loop
        let i = 0;
        if (member.type.baseType === BaseType.Float16) {
            for (let col = 0; col < numCols; ++col) {
                for (let row = 0; row < numRows; ++row) {
                    target[i] = float32ToFloat16(values[i]);
                    ++i;
                }
                if (skipW) ++i;
            }
        } else {
            for (let col = 0; col < numCols; ++col) {
                for (let row = 0; row < numRows; ++row) {
                    target[i] = values[i];
                    ++i;
                }
                if (skipW) ++i;
            }
        }

        return this;
    }

    /**
     * Upload the current buffer contents to the GPU.
     */
    upload() {
        this._buffer._uploadData(this._ctx);
    }

    /**
     * Internal accessor returning the underlying Buffer wrapper.
     * @internal
     */
    _getBuffer(): Buffer {
        return this._buffer;
    }
}