import {float32ToFloat16} from "../utils/float32ToFloat16";

/**
 * Utility for incrementally building binary data into an ArrayBuffer.
 * Provides typed push helpers for common numeric types used in vertex/index buffers.
 */
export class BufferDataWriter {
    private _buffer: ArrayBuffer;
    private _view: DataView;
    private _offset = 0;

    /** Create a new writer with the given total byte size. */
    constructor(byteSize: number) {
        this._buffer = new ArrayBuffer(byteSize);
        this._view = new DataView(this._buffer);
    }

    /** Push an unsigned 8-bit integer. */
    pushUint8(value: number): this {
        this._view.setUint8(this._offset, value);
        this._offset += 1;
        return this;
    }

    /** Push two unsigned 8-bit integers. */
    pushUint8x2(x: number, y: number): this {
        this.pushUint8(x);
        this.pushUint8(y);
        return this;
    }

    /** Push four unsigned 8-bit integers. */
    pushUint8x4(x: number, y: number, z: number, w: number): this {
        this.pushUint8(x);
        this.pushUint8(y);
        this.pushUint8(z);
        this.pushUint8(w);
        return this;
    }

    /** Push a signed 8-bit integer. */
    pushSint8(value: number): this {
        this._view.setInt8(this._offset, value);
        this._offset += 1;
        return this;
    }

    /** Push two signed 8-bit integers. */
    pushSint8x2(x: number, y: number): this {
        this.pushSint8(x);
        this.pushSint8(y);
        return this;
    }

    /** Push four signed 8-bit integers. */
    pushSint8x4(x: number, y: number, z: number, w: number): this {
        this.pushSint8(x);
        this.pushSint8(y);
        this.pushSint8(z);
        this.pushSint8(w);
        return this;
    }

    /** Push an unsigned 16-bit integer (little-endian). */
    pushUint16(value: number): this {
        this._view.setUint16(this._offset, value, true);
        this._offset += 2;
        return this;
    }

    /** Push two unsigned 16-bit integers (little-endian). */
    pushUint16x2(x: number, y: number): this {
        this.pushUint16(x);
        this.pushUint16(y);
        return this;
    }

    /** Push four unsigned 16-bit integers (little-endian). */
    pushUint16x4(x: number, y: number, z: number, w: number): this {
        this.pushUint16(x);
        this.pushUint16(y);
        this.pushUint16(z);
        this.pushUint16(w);
        return this;
    }

    /** Push a signed 16-bit integer (little-endian). */
    pushSint16(value: number): this {
        this._view.setInt16(this._offset, value, true);
        this._offset += 2;
        return this;
    }

    /** Push two signed 16-bit integers (little-endian). */
    pushSint16x2(x: number, y: number): this {
        this.pushSint16(x);
        this.pushSint16(y);
        return this;
    }

    /** Push four signed 16-bit integers (little-endian). */
    pushSint16x4(x: number, y: number, z: number, w: number): this {
        this.pushSint16(x);
        this.pushSint16(y);
        this.pushSint16(z);
        this.pushSint16(w);
        return this;
    }

    /** Push a 16-bit float (little-endian). */
    pushFloat16(value: number) {
        const bits = float32ToFloat16(value);
        this._view.setUint16(this._offset, bits, true);
        this._offset += 2;
        return this;
    }

    /** Push two 16-bit floats (little-endian). */
    pushFloat16x2(x: number, y: number): this {
        this.pushFloat16(x);
        this.pushFloat16(y);
        return this;
    }

    /** Push four 16-bit floats (little-endian). */
    pushFloat16x4(x: number, y: number, z: number, w: number): this {
        this.pushFloat16(x);
        this.pushFloat16(y);
        this.pushFloat16(z);
        this.pushFloat16(w);
        return this;
    }

    /** Push a 32-bit float (little-endian). */
    pushFloat32(value: number): this {
        this._view.setFloat32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    /** Push two 32-bit floats (little-endian). */
    pushFloat32x2(x: number, y: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        return this;
    }

    /** Push four 32-bit floats (little-endian). */
    pushFloat32x3(x: number, y: number, z: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        this.pushFloat32(z);
        return this;
    }

    /** Push an 8-bit float (little-endian). */
    pushFloat32x4(x: number, y: number, z: number, w: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        this.pushFloat32(z);
        this.pushFloat32(w);
        return this;
    }

    /** Push an unsigned 32-bit integer (little-endian). */
    pushUint32(value: number): this {
        this._view.setUint32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    /** Push two unsigned 32-bit integers (little-endian). */
    pushUint32x2(x: number, y: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        return this;
    }

    /** Push three unsigned 32-bit integers (little-endian). */
    pushUint32x3(x: number, y: number, z: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        this.pushUint32(z);
        return this;
    }

    /** Push four unsigned 32-bit integers (little-endian). */
    pushUint32x4(x: number, y: number, z: number, w: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        this.pushUint32(z);
        this.pushUint32(w);
        return this;
    }

    /** Push a signed 32-bit integer (little-endian). */
    pushSint32(value: number): this {
        this._view.setInt32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    /** Push two signed 32-bit integers (little-endian). */
    pushSint32x2(x: number, y: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        return this;
    }

    /** Push three signed 32-bit integers (little-endian). */
    pushSint32x3(x: number, y: number, z: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        this.pushSint32(z);
        return this;
    }

    /** Push four signed 32-bit integers (little-endian). */
    pushSint32x4(x: number, y: number, z: number, w: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        this.pushSint32(z);
        this.pushSint32(w);
        return this;
    }

    /** Returns the underlying ArrayBuffer containing all written data. */
    get arrayBuffer(): ArrayBuffer
    {
        return this._buffer;
    }
}