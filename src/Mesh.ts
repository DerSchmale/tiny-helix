import {Buffer, BufferBuilder, BufferUsage} from "./buffers/Buffer";
import {WebGPUContext} from "./WebGPUContext";
import {mapUndefined} from "./utils/mapUndefined";

/**
 * Index buffer formats supported by the library.
 */
export enum IndexFormat {
    Uint16 = 'uint16',
    Uint32 = 'uint32'
}

class IndexBuffer {
    buffer: Buffer;
    format: IndexFormat;
    count: number;

    constructor(data: Uint16Array | Uint32Array, ctx: WebGPUContext, keepData: boolean = false) {
        // Use BYTES_PER_ELEMENT on the union-typed array in a typed manner to avoid 'any' casts
        const bytesPerElement = (data as Uint16Array | Uint32Array).BYTES_PER_ELEMENT;
        this.format = bytesPerElement === 2 ? IndexFormat.Uint16 : IndexFormat.Uint32;
        this.count = data.length;
        this.buffer = new BufferBuilder(ctx)
            .withData(data.buffer, keepData)
            .withUsage(BufferUsage.CopyDst | BufferUsage.Index)
            .build();
    }
}

/**
 * Mesh topology enum (maps to GPU primitive topologies).
 */
export enum MeshTopology {
    TriangleList = 'triangle-list',
    TriangleStrip = 'triangle-strip',
    LineList = 'line-list',
    LineStrip = 'line-strip',
    PointList = 'point-list'
}

/**
 * Winding mode for front-facing triangles.
 */
export enum FrontFace {
    Clockwise = 'cw',
    CounterClockwise = 'ccw'
}

/**
 * Vertex attribute formats supported by the helper. These are translated into
 * GPU vertex attribute formats when building pipelines.
 */
export enum VertexFormat {
    Uint8 = 'uint8',
    Uint8x2 = 'uint8x2',
    Uint8x4 = 'uint8x4',
    Sint8 = 'sint8',
    Sint8x2 = 'sint8x2',
    Sint8x4 = 'sint8x4',
    Unorm8 = 'unorm8',
    Unorm8x2 = 'unorm8x2',
    Unorm8x4 = 'unorm8x4',
    Snorm8 = 'snorm8',
    Snorm8x2 = 'snorm8x2',
    Snorm8x4 = 'snorm8x4',
    Uint16 = 'uint16',
    Uint16x2 = 'uint16x2',
    Uint16x4 = 'uint16x4',
    Sint16 = 'sint16',
    Sint16x2 = 'sint16x2',
    Sint16x4 = 'sint16x4',
    Unorm16 = 'unorm16',
    Unorm16x2 = 'unorm16x2',
    Unorm16x4 = 'unorm16x4',
    Snorm16 = 'snorm16',
    Snorm16x2 = 'snorm16x2',
    Snorm16x4 = 'snorm16x4',
    Float16 = 'float16',
    Float16x2 = 'float16x2',
    Float16x4 = 'float16x4',
    Float32 = 'float32',
    Float32x2 = 'float32x2',
    Float32x3 = 'float32x3',
    Float32x4 = 'float32x4',
    Uint32 = 'uint32',
    Uint32x2 = 'uint32x2',
    Uint32x3 = 'uint32x3',
    Uint32x4 = 'uint32x4',
    Sint32 = 'sint32',
    Sint32x2 = 'sint32x2',
    Sint32x3 = 'sint32x3',
    Sint32x4 = 'sint32x4',
    Unorm10_10_10_2 = 'unorm10-10-10-2',
    Unorm8x4_bgra = 'unorm8x4-bgra'
}

/**
 * Lightweight Mesh representation containing vertex streams and an optional index buffer.
 * Use `MeshBuilder` to construct instances.
 */
export class Mesh {
    private _topology: MeshTopology;
    private _frontFace: FrontFace;
    private _streams: VertexStream[] = [];
    private _indexBuffer?: IndexBuffer;
    private _numVertices: number;

    /**
     * @internal
     */
    constructor(topology: MeshTopology, frontFace: FrontFace, streams: VertexStream[], indexBuffer?: IndexBuffer) {
        this._topology = topology;
        this._frontFace = frontFace;
        this._streams = streams;
        this._indexBuffer = indexBuffer;
        this._numVertices = this._streams[0].numVertices;

        this._streams.forEach(
            stream => console.assert(stream.numVertices === this._numVertices,
                "All vertex streams must have the same number of vertices."
            ));
    }

    /** The primitive topology for this mesh. */
    get topology(): MeshTopology {
        return this._topology;
    }

    /** The winding used to determine front-facing triangles. */
    get frontFace(): FrontFace {
        return this._frontFace;
    }

    /** The number of vertex streams in this mesh. */
    get numStreams() {
        return this._streams.length;
    }

    /** Get the number of vertices in the first vertex stream. */
    get numVertices() {
        return this._numVertices;
    }

    /** Get the GPU-backed vertex buffer for a given stream index. */
    getVertexBuffer(streamIndex: number): Buffer {
        return this._streams[streamIndex].buffer!;
    }

    /** Get the stride (byte size) of a vertex in the requested stream. */
    getStreamStride(streamIndex: number): number {
        return this._streams[streamIndex].stride;
    }

    /** Get the declared attributes for a vertex stream. */
    getStreamAttributes(streamIndex: number): VertexAttribute[] {
        return this._streams[streamIndex].attributes;
    }

    /** Get the optional index buffer backing this mesh. */
    get indexBuffer(): Buffer | undefined {
        return this._indexBuffer?.buffer;
    }

    /** Get the index format of the index buffer backing this mesh. */
    get indexFormat(): IndexFormat {
        return this._indexBuffer?.format ?? IndexFormat.Uint16;
    }

    /** Get the number of indices in the index buffer backing this mesh. */
    get numIndices(): number {
        return this._indexBuffer?.count ?? 0;
    }
}

function vertexFormatByteSize(format: VertexFormat): number {
    switch (format) {
        case VertexFormat.Uint8:
        case VertexFormat.Sint8:
        case VertexFormat.Unorm8:
        case VertexFormat.Snorm8:
            return 1;
        case VertexFormat.Uint8x2:
        case VertexFormat.Sint8x2:
        case VertexFormat.Unorm8x2:
        case VertexFormat.Snorm8x2:
        case VertexFormat.Uint16:
        case VertexFormat.Sint16:
        case VertexFormat.Unorm16:
        case VertexFormat.Snorm16:
        case VertexFormat.Float16:
            return 2;
        case VertexFormat.Uint8x4:
        case VertexFormat.Sint8x4:
        case VertexFormat.Unorm8x4:
        case VertexFormat.Snorm8x4:
        case VertexFormat.Uint16x2:
        case VertexFormat.Sint16x2:
        case VertexFormat.Unorm16x2:
        case VertexFormat.Snorm16x2:
        case VertexFormat.Float16x2:
        case VertexFormat.Float32:
        case VertexFormat.Uint32:
        case VertexFormat.Sint32:
        case VertexFormat.Unorm10_10_10_2:
        case VertexFormat.Unorm8x4_bgra:
            return 4;
        case VertexFormat.Uint16x4:
        case VertexFormat.Sint16x4:
        case VertexFormat.Unorm16x4:
        case VertexFormat.Snorm16x4:
        case VertexFormat.Float16x4:
        case VertexFormat.Float32x2:
        case VertexFormat.Uint32x2:
        case VertexFormat.Sint32x2:
            return 8;
        case VertexFormat.Float32x3:
        case VertexFormat.Uint32x3:
        case VertexFormat.Sint32x3:
            return 12;

        case VertexFormat.Float32x4:
        case VertexFormat.Uint32x4:
        case VertexFormat.Sint32x4:
            return 16;
    }
}

export type VertexAttribute = {
    name: string;
    format: VertexFormat;
    offset: number;
}

class VertexStream {
    stride: number = 0;
    attributes: VertexAttribute[] = [];
    buffer?: Buffer;

    pushAttribute(name: string, format: VertexFormat) {
        this.attributes.push({name, format, offset: this.stride});
        this.stride += vertexFormatByteSize(format);
    }

    get numVertices(): number {
        return this.buffer!.size / this.stride;
    }
}

/**
 * Builder helper used when creating a vertex stream for a Mesh.
 */
export class StreamBuilder {
    private _stream: VertexStream;
    private _ctx: WebGPUContext;

    /**
     * @internal
     */
    constructor(stream: VertexStream, ctx: WebGPUContext) {
        this._stream = stream;
        this._ctx = ctx;
    }

    /**
     * Add a vertex attribute to the stream.
     * @param name - attribute name used by the shader bindings
     * @param format - attribute format (see VertexFormat)
     */
    pushAttribute(name: string, format: VertexFormat): this {
        this._stream.pushAttribute(name, format);
        return this;
    }

    /**
     * Upload vertex data for this stream. `keepOnCPU` controls whether the
     * source ArrayBuffer is retained in memory for readback.
     */
    withData(data: ArrayBufferLike, keepOnCPU: boolean = false) {
        this._stream.buffer = new BufferBuilder(this._ctx)
            .withData(data, keepOnCPU)
            .withUsage(BufferUsage.Vertex | BufferUsage.CopyDst)
            .build();
    }
}

/**
 * Fluent builder for creating a Mesh. Use `pushStream()` to describe vertex
 * streams and `withIndexData()` to add optional indices.
 */
export class MeshBuilder {
    private _topology: MeshTopology = MeshTopology.TriangleList;
    private _frontFace: FrontFace = FrontFace.CounterClockwise;
    private _streams: VertexStream[] = [];
    private _ctx: WebGPUContext;
    private _indexBuffer?: IndexBuffer;

    /**
     * @internal
     */
    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    /** Add a vertex stream using a builder callback. */
    pushStream(buildFunc: (builder: StreamBuilder) => void): this {
        const stream = new VertexStream();
        buildFunc(new StreamBuilder(stream, this._ctx));
        console.assert(stream.buffer !== undefined, "Vertex stream must have a buffer. Did you forget to call withData()?");
        this._streams.push(stream);
        return this;
    }

    /** Set the winding used to determine front-facing triangles. Defaults to counter-clockwise. */
    withFrontFace(value: FrontFace): this {
        this._frontFace = value;
        return this;
    }

    /** Set the primitive topology for the mesh. Defaults to triangle list. */
    withTopology(value: MeshTopology): this {
        this._topology = value;
        return this;
    }

    /**
     * Provide index data (Uint16Array or Uint32Array). If `keepOnCPU` is true the
     * original array buffer will be preserved on the resulting mesh's index buffer.
     */
    withIndexData(data: Uint16Array | Uint32Array, keepOnCPU: boolean = false): this {
        this._indexBuffer = mapUndefined(data, data => new IndexBuffer(data, this._ctx, keepOnCPU));
        return this;
    }

    /** Build the mesh. */
    build(): Mesh {
        console.assert(this._streams.length > 0, "Mesh must have at least one vertex stream.");
        return new Mesh(
            this._topology,
            this._frontFace,
            this._streams,
            this._indexBuffer,
        );
    }
}
