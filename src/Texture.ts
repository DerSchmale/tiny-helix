import {WebGPUContext} from "./WebGPUContext";

/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
export class Texture {
    /** @internal */
    readonly _inner: GPUTexture;

    /**
     * Create a Texture wrapper from an existing GPUTexture.
     * @param texture - The underlying GPUTexture
     */
    static from_webgpu(texture: GPUTexture): Texture {
        return new Texture(texture);
    }

    constructor(inner: GPUTexture) {
        this._inner = inner;
    }
}

export class TextureBuilder {
    private _ctx: WebGPUContext;
    private _size: [number, number, number] = [1, 1, 1];
    private _data: ImageBitmap | undefined = undefined;
    private _format: GPUTextureFormat = "rgba8unorm-srgb";

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withSize(width: number, height: number, depthOrArrayLayers: number = 1): this {
        this._size = [width, height, depthOrArrayLayers];
        return this;
    }

    withFormat(format: GPUTextureFormat): this {
        this._format = format;
        return this;
    }

    withImage(data: ImageBitmap): this {
        this._data = data;
        this._size = [data.width, data.height, 1 ];
        return this;
    }

    build(): Texture
    {
        let usage = GPUTextureUsage.TEXTURE_BINDING;
        if (this._data) {
            usage |= GPUTextureUsage.COPY_DST;
        }
        const inner = this._ctx.device.createTexture({
            format: this._format, size: this._size, usage
        })
        if (this._data) {
            this._ctx.device.queue.copyExternalImageToTexture({source: this._data!}, {texture: inner}, [this._size[0], this._size[1], 1]);
        }
        return new Texture(inner);
    }
}