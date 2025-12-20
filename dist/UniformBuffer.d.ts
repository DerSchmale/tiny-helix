import { WebGPUContext } from "./WebGPUContext";
import { Buffer } from "./Buffer";
export declare enum BaseType {
    Float16 = 0,
    Float32 = 1,
    Uint = 2,
    Sint = 3,
    Boolean = 4
}
export type UBOFieldData = number[] | Float32Array | Uint32Array | Int32Array;
declare enum ContainerType {
    Scalar = 0,
    Vec = 1,
    Matrix2 = 2,// a matrix of 2 vec[numElements]<baseType>
    Matrix3 = 3,
    Matrix4 = 4,
    Array = 5
}
declare class MemberType {
    baseType: BaseType;
    containerType: ContainerType;
    numElements: number;
    constructor(baseType: BaseType, containerType: ContainerType, numElements: number);
    get size(): number;
    get alignment(): number;
}
interface Member {
    type: MemberType;
    offset: number;
}
export declare class UniformBufferLayoutBuilder {
    private _size;
    private _members;
    withSize(size: number): this;
    pushScalar(baseType: BaseType, name: string): this;
    pushVec2(baseType: BaseType, name: string): this;
    pushVec3(baseType: BaseType, name: string): this;
    pushVec4(baseType: BaseType, name: string): this;
    pushMatrix(baseType: BaseType, name: string, numRows: number, numCols: number): this;
    build(): UniformBufferLayout;
    private _pushField;
}
export declare class UniformBufferLayout {
    readonly size: number;
    private _members;
    constructor(size: number, members: Map<string, Member>);
    _writeScalar(name: string, value: number, target: DataView): void;
    _writeVec(name: string, values: UBOFieldData, target: DataView): void;
    _writeMatrix(name: string, values: UBOFieldData, target: DataView): void;
    private _getMemberOrThrow;
}
export declare class UniformBuffer {
    private _buffer;
    private _layout;
    private _dataInvalid;
    private _data;
    /**
     * @internal
     */
    constructor(layout: UniformBufferLayout, ctx: WebGPUContext);
    /**
     * Sets the value of a scalar field.
     * @param name Name of the scalar field.
     * @param value Value to set.
     */
    setScalar(name: string, value: number): this;
    /**
     * Sets the values for a vector field.
     * @param name Name of the vector field.
     * @param values Array of values to set.
     */
    setVec(name: string, values: number[]): this;
    /**
     * Sets the values for a matrix field.
     * @param name Name of the matrix field.
     * @param values Array of values to set. The values are expected to be in column-major order.
     */
    setMatrix(name: string, values: UBOFieldData): this;
    /**
     * @internal
     */
    _getBuffer(ctx: WebGPUContext): Buffer;
}
export {};
