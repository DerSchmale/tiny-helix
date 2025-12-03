import {WebGPUContext} from "../WebGPUContext";
import {Buffer, BufferBuilder} from "./Buffer";
import {float32ToFloat16} from "../utils/float32ToFloat16";
import {IBuffer} from "./IBuffer";

export enum BaseType {
    Float16,
    Float32,
    Uint,
    Sint,
    Boolean
}

export type UBOFieldData = number[] | Float32Array | Uint32Array | Int32Array;

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
    Matrix2,    // a matrix of 2 vec[numElements]<baseType>
    Matrix3,
    Matrix4,
    Array,
}

class MemberType {
    baseType: BaseType;
    containerType: ContainerType;
    numElements: number = 1;

    constructor(baseType: BaseType, containerType: ContainerType, numElements: number) {
        if (containerType === ContainerType.Scalar && numElements !== 1) {
            throw new Error("Scalar member must have numElements = 1.");
        }

        this.baseType = baseType;
        this.containerType = containerType;
        this.numElements = numElements;
    }

    get size(): number {
        // when we're dealing with matrices, storing vec3f internally stores as vec4f
        let numElements = this.numElements === 3 ? 4 : this.numElements;
        let numRows = 1;

        switch (this.containerType) {
            case ContainerType.Vec:
                // only case where the matrix correction is wrong
                numElements = this.numElements;
                break;
            case ContainerType.Matrix2:
                numRows = 2;
                break;
            case ContainerType.Matrix3:
                numRows = 3;
                break;
            case ContainerType.Matrix4:
                numRows = 4;
                break;
        }

        return sizeForBaseType(this.baseType) * numElements * numRows;
    }

    get alignment(): number {
        const numElements = this.numElements === 3 ? 4 : this.numElements;
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

    withSize(size: number): this {
        if (this._size !== 0) throw new Error("Size already set.");
        this._size = size;
        return this;
    }

    pushScalar(baseType: BaseType, name: string): this {
        return this._pushField(baseType, name, ContainerType.Scalar, 1);
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

    pushMatrix(baseType: BaseType, name: string, numRows: number, numCols: number): this {
        if (!Number.isInteger(numRows) || !Number.isInteger(numCols)) {
            throw new Error('Matrix dimensions must be integers');
        }
        if (numRows < 2 || numRows > 4 || numCols < 2 || numCols > 4) {
            throw new Error('Matrix dimensions must be between 2 and 4 (inclusive)');
        }

        let container: ContainerType;

        switch (numRows) {
            case 2:
                container = ContainerType.Matrix2;
                break;
            case 3:
                container = ContainerType.Matrix3;
                break;
            case 4:
                container = ContainerType.Matrix4;
                break;
            default:
                throw new Error('Unreachable');
        }

        return this._pushField(baseType, name, container, numCols);
    }

    build(): UniformBufferLayout {
        // round up to 16 byte alignment with a 16 byte minimum
        this._size = Math.min(Math.ceil(this._size / 16) * 16, 16);
        return new UniformBufferLayout(this._size, this._members);
    }

    private _pushField(baseType: BaseType, name: string, containerType: ContainerType, numElements: number = 1): this {
        const type = new MemberType(baseType, containerType, numElements);
        const alignment = type.alignment;
        const offset = Math.ceil(this._size / alignment) * alignment;
        this._members.set(name, {offset, type});
        this._size += offset + type.size;
        return this;
    }
}

export class UniformBufferLayout {
    readonly size: number;
    private _members: Map<string, Member>;

    constructor(size: number, members: Map<string, Member>) {
        this.size = size;
        this._members = members;
    }

    _writeScalar(name: string, value: number, target: DataView) {
        const member = this._getMemberOrThrow(name);

        console.assert(member.type.containerType === ContainerType.Scalar, `Expected scalar container for member ${name}, got ${member.type.containerType}.`);

        switch (member.type.baseType) {
            case BaseType.Float16:
                target.setUint16(member.offset, float32ToFloat16(value), true);
                break;
            case BaseType.Float32:
                target.setFloat32(member.offset, value, true);
                break;
            case BaseType.Uint:
                target.setUint32(member.offset, value, true);
                break;
            case BaseType.Sint:
                target.setInt32(member.offset, value, true);
                break;
            case BaseType.Boolean:
                target.setInt32(member.offset, value === 0 ? 0 : 1, true);

        }
    }

    _writeVec(name: string, values: UBOFieldData, target: DataView) {
        const member = this._getMemberOrThrow(name);

        console.assert(values.length === member.type.numElements, `Expected ${member.type.numElements} elements for member ${name}, got ${values.length}.`);
        console.assert(member.type.containerType === ContainerType.Vec, `Expected vec container for member ${name}, got ${member.type.containerType}.`);

        // I know looping inside the cases looks ugly and the loops are tiny, but I just can't bring myself to put
        // a switch in a loop
        switch (member.type.baseType) {
            case BaseType.Float16:
                for (let i = 0, offset = member.offset; i < values.length; ++i, offset += 2) {
                    target.setUint16(offset, float32ToFloat16(values[i]), true);
                }
                break;
            case BaseType.Float32:
                for (let i = 0, offset = member.offset; i < values.length; ++i, offset += 4) {
                    target.setFloat32(offset, values[i], true);
                }
                break;
            case BaseType.Uint:
                for (let i = 0, offset = member.offset; i < values.length; ++i, offset += 4) {
                    target.setUint32(offset, values[i], true);
                }
                break;
            case BaseType.Sint:
                for (let i = 0, offset = member.offset; i < values.length; ++i, offset += 4) {
                    target.setInt32(offset, values[i], true);
                }
                break;
            case BaseType.Boolean:
                for (let i = 0, offset = member.offset; i < values.length; ++i, offset += 4) {
                    target.setInt32(offset, values[i] === 0 ? 0 : 1, true);
                }
                break;
        }
    }

    _writeMatrix(name: string, values: UBOFieldData, target: DataView) {
        const member = this._getMemberOrThrow(name);
        const numCols = member.type.numElements;
        const colSize = numCols === 3? 4 : numCols;
        let numRows;
        switch (member.type.containerType) {
            case ContainerType.Matrix2:
                numRows = 2;
                break;
            case ContainerType.Matrix3:
                numRows = 3;
                break;
            case ContainerType.Matrix4:
                numRows = 4;
                break;
            default:
                throw new Error(`Expected matrix container type. Got ${member.type.containerType}.`);
        }

        console.assert(values.length === numRows * numCols, `Expected ${numRows * numCols} elements for member ${name}, got ${values.length}.`);

        // I know looping inside the cases looks ugly and the loops are tiny, but I just can't bring myself to put
        // a switch in a loop
        switch (member.type.baseType) {
            case BaseType.Float16:
                for (let row = 0, rowOffset = member.offset, i = 0; row < numRows; ++row, rowOffset += colSize) {
                    for (let col = 0, offset = rowOffset; col < numCols; ++col, offset += 2, ++i) {
                        target.setUint16(rowOffset, float32ToFloat16(values[i]), true);
                    }
                }
                break;
            case BaseType.Float32:
                for (let row = 0, rowOffset = member.offset, i = 0; row < numRows; ++row, rowOffset += colSize) {
                    for (let col = 0, offset = rowOffset; col < numCols; ++col, offset += 4, ++i) {
                        target.setFloat32(offset, values[i], true);
                    }
                }
                break;
            case BaseType.Uint:
                for (let row = 0, rowOffset = member.offset, i = 0; row < numRows; ++row, rowOffset += colSize) {
                    for (let col = 0, offset = rowOffset; col < numCols; ++col, offset += 4, ++i) {
                        target.setUint32(rowOffset, values[i], true);
                    }
                }
                break;
            case BaseType.Sint:
                for (let row = 0, rowOffset = member.offset, i = 0; row < numRows; ++row, rowOffset += colSize) {
                    for (let col = 0, offset = rowOffset; col < numCols; ++col, offset += 4, ++i) {
                        target.setInt32(rowOffset, values[i], true);
                    }
                }
                break;
            case BaseType.Boolean:
                for (let row = 0, rowOffset = member.offset, i = 0; row < numRows; ++row, rowOffset += colSize) {
                    for (let col = 0, offset = rowOffset; col < numCols; ++col, offset += 4, ++i) {
                        target.setInt32(rowOffset, values[i] ? 1 : 0, true);
                    }
                }
                break;
        }
    }

    private _getMemberOrThrow(name: string): Member {
        const member = this._members.get(name);
        if (!member) {
            throw new Error(`Member ${name} not found in layout.`);
        }
        return member;
    }
}

export class UniformBuffer implements IBuffer {
    private _buffer: Buffer;
    private _layout: UniformBufferLayout;
    private _data: DataView;
    private _ctx: WebGPUContext;

    /**
     * @internal
     */
    constructor(layout: UniformBufferLayout, ctx: WebGPUContext) {
        const data = new ArrayBuffer(layout.size);
        this._layout = layout;
        this._buffer = new BufferBuilder(ctx)
            .withUsage(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST)
            .withData(data, true)
            .build();
        this._data = new DataView(this._buffer.data!);
        this._ctx = ctx;
    }

    /**
     * Sets the value of a scalar field.
     * @param name Name of the scalar field.
     * @param value Value to set.
     */
    setScalar(name: string, value: number): this {
        this._layout._writeScalar(name, value, this._data);
        return this;
    }

    /**
     * Sets the values for a vector field.
     * @param name Name of the vector field.
     * @param values Array of values to set.
     */
    setVec(name: string, values: number[]): this {
        this._layout._writeVec(name, values, this._data);
        return this;
    }

    /**
     * Sets the values for a matrix field.
     * @param name Name of the matrix field.
     * @param values Array of values to set. The values are expected to be in column-major order.
     */
    setMatrix(name: string, values: UBOFieldData): this {
        this._layout._writeMatrix(name, values, this._data);
        return this;
    }

    upload()
    {
        this._buffer._uploadData(this._ctx);
    }

    /**
     * @internal
     */
    _getBuffer(): Buffer {
        return this._buffer;
    }
}