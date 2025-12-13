import {WebGPUContext} from "../WebGPUContext";
import {mapUndefined} from "../utils/mapUndefined";
import {padArrayBuffer} from "../utils/padArrayBuffer";
import {IBuffer} from "./IBuffer";

/**
 * Buffer usage flags re-exported from the WebGPU API for convenience.
 * Use these when constructing buffers with `BufferBuilder.withUsage()`.
 */
export enum BufferUsage {
    MapRead = GPUBufferUsage.MAP_READ,
    MapWrite = GPUBufferUsage.MAP_WRITE,
    CopySrc = GPUBufferUsage.COPY_SRC,
    CopyDst = GPUBufferUsage.COPY_DST,
    Index = GPUBufferUsage.INDEX,
    Vertex = GPUBufferUsage.VERTEX,
    Uniform = GPUBufferUsage.UNIFORM,
    Storage = GPUBufferUsage.STORAGE,
    Indirect = GPUBufferUsage.INDIRECT,
    QueryResolve = GPUBufferUsage.QUERY_RESOLVE
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
export class BufferBuilder {
    private _ctx: WebGPUContext;
    private _data?: ArrayBufferLike;
    private _size = 0;
    private _keepData = false;
    private _usage: number = 0;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    /**
     * Add usage flags for the GPU buffer.
     */
    withUsage(usage: BufferUsage): this
    {
        this._usage |= usage;
        return this;
    }

    /**
     * Provide initial data for the buffer. If `keepOnCPU` is true the original
     * ArrayBuffer is stored in the resulting `Buffer.data` field for readback or
     * reuse.
     */
    withData(data: ArrayBufferLike, keepOnCPU: boolean = false) {
        this._data = data;
        // round to the nearest multiple of 4 bytes, as required by GPUBuffer.writeBuffer()
        this._size = data.byteLength;
        this._keepData = keepOnCPU;
        return this;
    }

    /**
     * Create the GPU buffer and upload any provided data.
     */
    build(): Buffer {
        const data = mapUndefined(this._data, data => padArrayBuffer(data, 4));
        const buffer = this._ctx.device.createBuffer({
            size: data? data.byteLength : this._size, // in case we don't have data, we need to specify the size explicitly'
            usage: this._usage
        });

        if (data) {
            this._ctx.device.queue.writeBuffer(buffer, 0, data);
        }

        return new Buffer(buffer, this._keepData? this._data : undefined);
    }
}

/**
 * Lightweight wrapper around a GPUBuffer. Exposes the original CPU-side data
 * (when kept) and the underlying GPU buffer for low-level interop.
 */
export class Buffer implements IBuffer {
    readonly _inner: GPUBuffer;
    readonly data?: ArrayBufferLike;

    /**
     * Create a Buffer from an existing GPUBuffer.
     * @param inner The underlying GPUBuffer.
     * @param data Optional CPU-side copy of the buffer contents.
     */
    constructor(inner: GPUBuffer, data?: ArrayBufferLike) {
        this._inner = inner;
        this.data = data;
    }

    /** Size of the GPU buffer in bytes. */
    get size(): number { return this._inner.size; }

    _uploadData(ctx: WebGPUContext)
    {
        if (!this.data) {
            console.warn("Buffer has no data to upload.");
            return;
        }

        ctx.device.queue.writeBuffer(this._inner, 0, this.data);
    }

    _getBufferResource(): GPUBindingResource {
        return { buffer: this._inner };
    }
}