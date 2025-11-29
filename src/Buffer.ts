import {WebGPUContext} from "./WebGPUContext";
import {mapUndefined} from "./utils/mapUndefined";
import {padArrayBuffer} from "./utils/padArrayBuffer";

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

export class BufferBuilder {
    private _ctx: WebGPUContext;
    private _data?: ArrayBufferLike;
    private _size = 0;
    private _keepData = false;
    private _usage: number = 0;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withUsage(usage: BufferUsage): this
    {
        this._usage |= usage;
        return this;
    }

    withData(data: ArrayBufferLike, keepOnCPU: boolean = false) {
        this._data = data;
        // round to the nearest multiple of 4 bytes, as required by GPUBuffer.writeBuffer()
        this._size = data.byteLength;
        this._keepData = keepOnCPU;
        return this;
    }

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

export class Buffer {
    private _data?: ArrayBufferLike;
    private _inner: GPUBuffer;

    constructor(inner: GPUBuffer, data?: ArrayBufferLike) {
        this._inner = inner;
        this._data = data;
    }

    get inner(): GPUBuffer { return this._inner; }
    get data(): ArrayBufferLike | undefined { return this._data; }
}