/// <reference types="@webgpu/types" />
import { WebGPUContext } from "../WebGPUContext";
import { IBuffer } from "./IBuffer";
import { IndexedCollection } from "../utils/IndexedCollection";
/**
 * Primitive base types supported by the uniform buffer helpers.
 * These correspond to WGSL scalar types used inside UBOs.
 */
export declare enum BaseType {
    Float16 = 0,
    Float32 = 1,
    Uint = 2,
    Sint = 3,
    Boolean = 4
}
declare enum ContainerType {
    Scalar = 0,
    Vec = 1,
    Matrix = 2,// a matrix of 2 vec[numElements]<baseType>
    Array = 3
}
declare class MemberType {
    baseType: BaseType;
    containerType: ContainerType;
    numRows: number;
    numCols: number;
    constructor(baseType: BaseType, containerType: ContainerType, numRows: number, numCols: number);
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
    /**
     * Reserve an explicit size for the resulting UBO layout. If not set the
     * builder will compute a size that fits all declared members.
     */
    withSize(size: number): this;
    pushScalar(baseType: BaseType, name: string): this;
    pushVec2(baseType: BaseType, name: string): this;
    pushVec3(baseType: BaseType, name: string): this;
    pushVec4(baseType: BaseType, name: string): this;
    pushMatrix(baseType: BaseType, numRows: number, numCols: number, name: string): this;
    /**
     * Finalize and return a `UniformBufferLayout` describing member offsets and total size.
     */
    build(): UniformBufferLayout;
    private _pushField;
}
/**
 * Describes the layout of a uniform buffer including member offsets and total size.
 * Use `UniformBufferLayoutBuilder` to construct instances.
 */
export declare class UniformBufferLayout {
    readonly size: number;
    private _members;
    constructor(size: number, members: Map<string, Member>);
    /**
     * Create typed DataViews for each member of the layout.
     * @internal
     */
    _createDataViews(target: ArrayBuffer): Map<string, [Member, IndexedCollection]>;
    private _getMemberOrThrow;
}
/**
 * GPU-backed uniform buffer wrapper providing typed setters and an upload method.
 * Use {@link TinyHelix.createUniformBuffer} to create instances.
 */
export declare class UniformBuffer implements IBuffer {
    private _buffer;
    private _data;
    private _ctx;
    private _dataViews;
    /**
     * Create a new UniformBuffer with the given layout and WebGPU context.
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
    setVec(name: string, values: number[] | IndexedCollection): this;
    /**
     * Sets the values for a matrix field.
     * @param name Name of the matrix field.
     * @param values Array of values to set. The values are expected to be in column-major order.
     */
    setMatrix(name: string, values: number[] | IndexedCollection): this;
    /**
     * Upload the current buffer contents to the GPU.
     */
    upload(): this;
    /**
     * Internal accessor returning the underlying Buffer wrapper.
     * @internal
     */
    _getBufferResource(): GPUBindingResource;
}
export {};
