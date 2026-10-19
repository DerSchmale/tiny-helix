/// <reference types="@webgpu/types" />
import { WebGPUContext } from "../WebGPUContext";
import { IBuffer } from "./IBuffer";
/**
 * Buffer usage flags re-exported from the WebGPU API for convenience.
 * Use these when constructing buffers with `BufferBuilder.withUsage()`.
 */
export declare enum BufferUsage {
    MapRead = 1,
    MapWrite = 2,
    CopySrc = 4,
    CopyDst = 8,
    Index = 16,
    Vertex = 32,
    Uniform = 64,
    Storage = 128,
    Indirect = 256,
    QueryResolve = 512
}
export declare enum TextureUsage {
    CopySrc = 1,
    CopyDst = 2,
    TextureBinding = 4,
    StorageBinding = 8,
    RenderAttachment = 16,
    TransientAttachment = 32
}
/**
 * Builder for creating GPU-backed buffers.
 *
 * Example:
 * const buf = new BufferBuilder(ctx)
 *   .withUsage(BufferUsage.Vertex | BufferUsage.CopyDst)
 *   .withData(new Float32Array([...]).buffer)
 *   .build();
 */
export declare class BufferBuilder {
    private _ctx;
    private _data?;
    private _size;
    private _keepData;
    private _usage;
    private _dataOffset;
    constructor(ctx: WebGPUContext);
    /**
     * Add usage flags for the GPU buffer.
     */
    withUsage(usage: BufferUsage): this;
    /**
     * Provide initial data for the buffer. If `keepOnCPU` is true the original
     * ArrayBuffer is stored in the resulting `Buffer.data` field for readback or
     * reuse.
     */
    withData(data: ArrayBufferLike, keepOnCPU?: boolean, offset?: number, length?: number): this;
    /**
     * Specify a size for the buffer, used when not providing data.
     */
    withSize(size: number): this;
    /**
     * Create the GPU buffer and upload any provided data.
     */
    build(): Buffer;
}
/**
 * Lightweight wrapper around a GPUBuffer. Exposes the original CPU-side data
 * (when kept) and the underlying GPU buffer for low-level interop.
 */
export declare class Buffer implements IBuffer {
    readonly _inner: GPUBuffer;
    readonly data?: ArrayBufferLike;
    private _ctx;
    /**
     * Create a Buffer from an existing GPUBuffer.
     * @param inner The underlying GPUBuffer.
     * @param ctx The WebGPUContext
     * @param data Optional CPU-side copy of the buffer contents.
     */
    constructor(inner: GPUBuffer, ctx: WebGPUContext, data?: ArrayBufferLike);
    /** Size of the GPU buffer in bytes. */
    get size(): number;
    uploadData(): void;
    _getBufferResource(): GPUBindingResource;
}
