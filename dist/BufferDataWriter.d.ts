/**
 * Utility for incrementally building binary data into an ArrayBuffer.
 * Provides typed push helpers for common numeric types used in vertex/index buffers.
 */
export declare class BufferDataWriter {
    private _buffer;
    private _view;
    private _offset;
    /** Create a new writer with the given total byte size. */
    constructor(byteSize: number);
    /** Push an unsigned 8-bit integer. */
    pushUint8(value: number): this;
    /** Push two unsigned 8-bit integers. */
    pushUint8x2(x: number, y: number): this;
    /** Push four unsigned 8-bit integers. */
    pushUint8x4(x: number, y: number, z: number, w: number): this;
    /** Push a signed 8-bit integer. */
    pushSint8(value: number): this;
    /** Push two signed 8-bit integers. */
    pushSint8x2(x: number, y: number): this;
    /** Push four signed 8-bit integers. */
    pushSint8x4(x: number, y: number, z: number, w: number): this;
    /** Push an unsigned 16-bit integer (little-endian). */
    pushUint16(value: number): this;
    /** Push two unsigned 16-bit integers (little-endian). */
    pushUint16x2(x: number, y: number): this;
    /** Push four unsigned 16-bit integers (little-endian). */
    pushUint16x4(x: number, y: number, z: number, w: number): this;
    /** Push a signed 16-bit integer (little-endian). */
    pushSint16(value: number): this;
    /** Push two signed 16-bit integers (little-endian). */
    pushSint16x2(x: number, y: number): this;
    /** Push four signed 16-bit integers (little-endian). */
    pushSint16x4(x: number, y: number, z: number, w: number): this;
    /** Push a 16-bit float (little-endian). */
    pushFloat16(value: number): this;
    /** Push two 16-bit floats (little-endian). */
    pushFloat16x2(x: number, y: number): this;
    /** Push four 16-bit floats (little-endian). */
    pushFloat16x4(x: number, y: number, z: number, w: number): this;
    /** Push a 32-bit float (little-endian). */
    pushFloat32(value: number): this;
    /** Push two 32-bit floats (little-endian). */
    pushFloat32x2(x: number, y: number): this;
    /** Push four 32-bit floats (little-endian). */
    pushFloat32x3(x: number, y: number, z: number): this;
    /** Push an 8-bit float (little-endian). */
    pushFloat32x4(x: number, y: number, z: number, w: number): this;
    /** Push an unsigned 32-bit integer (little-endian). */
    pushUint32(value: number): this;
    /** Push two unsigned 32-bit integers (little-endian). */
    pushUint32x2(x: number, y: number): this;
    /** Push three unsigned 32-bit integers (little-endian). */
    pushUint32x3(x: number, y: number, z: number): this;
    /** Push four unsigned 32-bit integers (little-endian). */
    pushUint32x4(x: number, y: number, z: number, w: number): this;
    /** Push a signed 32-bit integer (little-endian). */
    pushSint32(value: number): this;
    /** Push two signed 32-bit integers (little-endian). */
    pushSint32x2(x: number, y: number): this;
    /** Push three signed 32-bit integers (little-endian). */
    pushSint32x3(x: number, y: number, z: number): this;
    /** Push four signed 32-bit integers (little-endian). */
    pushSint32x4(x: number, y: number, z: number, w: number): this;
    /** Returns the underlying ArrayBuffer containing all written data. */
    get arrayBuffer(): ArrayBuffer;
}
