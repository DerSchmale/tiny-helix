export class BufferDataWriter {
    private _buffer: ArrayBuffer;
    private _view: DataView;
    private _offset = 0;

    constructor(byteSize: number) {
        this._buffer = new ArrayBuffer(byteSize);
        this._view = new DataView(this._buffer);
    }

    pushUint8(value: number): this {
        this._view.setUint8(this._offset, value);
        this._offset += 1;
        return this;
    }

    pushUint8x2(x: number, y: number): this {
        this.pushUint8(x);
        this.pushUint8(y);
        return this;
    }

    pushUint8x4(x: number, y: number, z: number, w: number): this {
        this.pushUint8(x);
        this.pushUint8(y);
        this.pushUint8(z);
        this.pushUint8(w);
        return this;
    }

    pushSint8(value: number): this {
        this._view.setInt8(this._offset, value);
        this._offset += 1;
        return this;
    }

    pushSint8x2(x: number, y: number): this {
        this.pushSint8(x);
        this.pushSint8(y);
        return this;
    }

    pushSint8x4(x: number, y: number, z: number, w: number): this {
        this.pushSint8(x);
        this.pushSint8(y);
        this.pushSint8(z);
        this.pushSint8(w);
        return this;
    }

    pushUint16(value: number): this {
        this._view.setUint16(this._offset, value, true);
        this._offset += 2;
        return this;
    }

    pushUint16x2(x: number, y: number): this {
        this.pushUint16(x);
        this.pushUint16(y);
        return this;
    }

    pushUint16x4(x: number, y: number, z: number, w: number): this {
        this.pushUint16(x);
        this.pushUint16(y);
        this.pushUint16(z);
        this.pushUint16(w);
        return this;
    }

    pushSint16(value: number): this {
        this._view.setInt16(this._offset, value, true);
        this._offset += 2;
        return this;
    }

    pushSint16x2(x: number, y: number): this {
        this.pushSint16(x);
        this.pushSint16(y);
        return this;
    }

    pushSint16x4(x: number, y: number, z: number, w: number): this {
        this.pushSint16(x);
        this.pushSint16(y);
        this.pushSint16(z);
        this.pushSint16(w);
        return this;
    }

    pushFloat16(value: number) {
        this._view.setFloat16(this._offset, value, true);
        this._offset += 2;
        return this;
    }

    pushFloat16x2(x: number, y: number): this {
        this.pushFloat16(x);
        this.pushFloat16(y);
        return this;
    }

    pushFloat16x4(x: number, y: number, z: number, w: number): this {
        this.pushFloat16(x);
        this.pushFloat16(y);
        this.pushFloat16(z);
        this.pushFloat16(w);
        return this;
    }

    pushFloat32(value: number): this {
        this._view.setFloat32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    pushFloat32x2(x: number, y: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        return this;
    }

    pushFloat32x3(x: number, y: number, z: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        this.pushFloat32(z);
        return this;
    }

    pushFloat32x4(x: number, y: number, z: number, w: number): this {
        this.pushFloat32(x);
        this.pushFloat32(y);
        this.pushFloat32(z);
        this.pushFloat32(w);
        return this;
    }

    pushUint32(value: number): this {
        this._view.setUint32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    pushUint32x2(x: number, y: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        return this;
    }

    pushUint32x3(x: number, y: number, z: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        this.pushUint32(z);
        return this;
    }

    pushUint32x4(x: number, y: number, z: number, w: number): this {
        this.pushUint32(x);
        this.pushUint32(y);
        this.pushUint32(z);
        this.pushUint32(w);
        return this;
    }

    pushSint32(value: number): this {
        this._view.setInt32(this._offset, value, true);
        this._offset += 4;
        return this;
    }

    pushSint32x2(x: number, y: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        return this;
    }

    pushSint32x3(x: number, y: number, z: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        this.pushSint32(z);
        return this;
    }

    pushSint32x4(x: number, y: number, z: number, w: number): this {
        this.pushSint32(x);
        this.pushSint32(y);
        this.pushSint32(z);
        this.pushSint32(w);
        return this;
    }


    get arrayBuffer(): ArrayBuffer
    {
        return this._buffer;
    }
}