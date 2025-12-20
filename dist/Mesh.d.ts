import { Buffer } from "./buffers/Buffer";
import { WebGPUContext } from "./WebGPUContext";
/**
 * Index buffer formats supported by the library.
 */
export declare enum IndexFormat {
    Uint16 = "uint16",
    Uint32 = "uint32"
}
declare class IndexBuffer {
    buffer: Buffer;
    format: IndexFormat;
    count: number;
    constructor(data: Uint16Array | Uint32Array, ctx: WebGPUContext, keepData?: boolean);
}
/**
 * Mesh topology enum (maps to GPU primitive topologies).
 */
export declare enum MeshTopology {
    TriangleList = "triangle-list",
    TriangleStrip = "triangle-strip",
    LineList = "line-list",
    LineStrip = "line-strip",
    PointList = "point-list"
}
/**
 * Winding mode for front-facing triangles.
 */
export declare enum FrontFace {
    Clockwise = "cw",
    CounterClockwise = "ccw"
}
/**
 * Vertex attribute formats supported by the helper. These are translated into
 * GPU vertex attribute formats when building pipelines.
 */
export declare enum VertexFormat {
    Uint8 = "uint8",
    Uint8x2 = "uint8x2",
    Uint8x4 = "uint8x4",
    Sint8 = "sint8",
    Sint8x2 = "sint8x2",
    Sint8x4 = "sint8x4",
    Unorm8 = "unorm8",
    Unorm8x2 = "unorm8x2",
    Unorm8x4 = "unorm8x4",
    Snorm8 = "snorm8",
    Snorm8x2 = "snorm8x2",
    Snorm8x4 = "snorm8x4",
    Uint16 = "uint16",
    Uint16x2 = "uint16x2",
    Uint16x4 = "uint16x4",
    Sint16 = "sint16",
    Sint16x2 = "sint16x2",
    Sint16x4 = "sint16x4",
    Unorm16 = "unorm16",
    Unorm16x2 = "unorm16x2",
    Unorm16x4 = "unorm16x4",
    Snorm16 = "snorm16",
    Snorm16x2 = "snorm16x2",
    Snorm16x4 = "snorm16x4",
    Float16 = "float16",
    Float16x2 = "float16x2",
    Float16x4 = "float16x4",
    Float32 = "float32",
    Float32x2 = "float32x2",
    Float32x3 = "float32x3",
    Float32x4 = "float32x4",
    Uint32 = "uint32",
    Uint32x2 = "uint32x2",
    Uint32x3 = "uint32x3",
    Uint32x4 = "uint32x4",
    Sint32 = "sint32",
    Sint32x2 = "sint32x2",
    Sint32x3 = "sint32x3",
    Sint32x4 = "sint32x4",
    Unorm10_10_10_2 = "unorm10-10-10-2",
    Unorm8x4_bgra = "unorm8x4-bgra"
}
/**
 * Lightweight Mesh representation containing vertex streams and an optional index buffer.
 * Use `MeshBuilder` to construct instances.
 */
export declare class Mesh {
    private _topology;
    private _frontFace;
    private _streams;
    private _indexBuffer?;
    private _numVertices;
    /**
     * @internal
     */
    constructor(topology: MeshTopology, frontFace: FrontFace, streams: VertexStream[], indexBuffer?: IndexBuffer);
    /** The primitive topology for this mesh. */
    get topology(): MeshTopology;
    /** The winding used to determine front-facing triangles. */
    get frontFace(): FrontFace;
    /** The number of vertex streams in this mesh. */
    get numStreams(): number;
    /** Get the number of vertices in the first vertex stream. */
    get numVertices(): number;
    /** Get the GPU-backed vertex buffer for a given stream index. */
    getVertexBuffer(streamIndex: number): Buffer;
    /** Get the stride (byte size) of a vertex in the requested stream. */
    getStreamStride(streamIndex: number): number;
    /** Get the declared attributes for a vertex stream. */
    getStreamAttributes(streamIndex: number): VertexAttribute[];
    /** Get the optional index buffer backing this mesh. */
    get indexBuffer(): Buffer | undefined;
    /** Get the index format of the index buffer backing this mesh. */
    get indexFormat(): IndexFormat;
    /** Get the number of indices in the index buffer backing this mesh. */
    get numIndices(): number;
}
export type VertexAttribute = {
    name: string;
    format: VertexFormat;
    offset: number;
};
declare class VertexStream {
    stride: number;
    attributes: VertexAttribute[];
    buffer?: Buffer;
    pushAttribute(name: string, format: VertexFormat): void;
    get numVertices(): number;
}
/**
 * Builder helper used when creating a vertex stream for a Mesh.
 */
export declare class StreamBuilder {
    private _stream;
    private _ctx;
    /**
     * @internal
     */
    constructor(stream: VertexStream, ctx: WebGPUContext);
    /**
     * Add a vertex attribute to the stream.
     * @param name - attribute name used by the shader bindings
     * @param format - attribute format (see VertexFormat)
     */
    pushAttribute(name: string, format: VertexFormat): this;
    /**
     * Upload vertex data for this stream. `keepOnCPU` controls whether the
     * source ArrayBuffer is retained in memory for readback.
     */
    withData(data: ArrayBufferLike, keepOnCPU?: boolean): void;
}
/**
 * Fluent builder for creating a Mesh. Use `pushStream()` to describe vertex
 * streams and `withIndexData()` to add optional indices.
 */
export declare class MeshBuilder {
    private _topology;
    private _frontFace;
    private _streams;
    private _ctx;
    private _indexBuffer?;
    /**
     * @internal
     */
    constructor(ctx: WebGPUContext);
    /** Add a vertex stream using a builder callback. */
    pushStream(buildFunc: (builder: StreamBuilder) => void): this;
    /** Set the winding used to determine front-facing triangles. Defaults to counter-clockwise. */
    withFrontFace(value: FrontFace): this;
    /** Set the primitive topology for the mesh. Defaults to triangle list. */
    withTopology(value: MeshTopology): this;
    /**
     * Provide index data (Uint16Array or Uint32Array). If `keepOnCPU` is true the
     * original array buffer will be preserved on the resulting mesh's index buffer.
     */
    withIndexData(data: Uint16Array | Uint32Array, keepOnCPU?: boolean): this;
    /** Build the mesh. */
    build(): Mesh;
}
export {};
