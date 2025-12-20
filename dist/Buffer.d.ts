/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
/**
 * Buffer usage flags re-exported from the WebGPU API for convenience.
 * Use these when constructing buffers with `BufferBuilder.withUsage()`.
 */
export declare enum BufferUsage {
    MapRead,
    MapWrite,
    CopySrc,
    CopyDst,
    Index,
    Vertex,
    Uniform,
    Storage,
    Indirect,
    QueryResolve
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
    withData(data: ArrayBufferLike, keepOnCPU?: boolean): this;
    /**
     * Create the GPU buffer and upload any provided data.
     */
    build(): Buffer;
}
/**
 * Lightweight wrapper around a GPUBuffer. Exposes the original CPU-side data
 * (when kept) and the underlying GPU buffer for low-level interop.
 */
export declare class Buffer {
    readonly _inner: GPUBuffer;
    readonly data?: ArrayBufferLike;
    /**
     * Create a Buffer from an existing GPUBuffer.
     * @param inner The underlying GPUBuffer.
     * @param data Optional CPU-side copy of the buffer contents.
     */
    constructor(inner: GPUBuffer, data?: ArrayBufferLike);
    /** Size of the GPU buffer in bytes. */
    get size(): number;
    _uploadData(ctx: WebGPUContext): void;
}
