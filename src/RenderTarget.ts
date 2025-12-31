import {Texture} from "./Texture";
import {TextureFormat} from "./enums";

/**
 * Lightweight wrapper around a GPUTextureView representing a render target.
 * Use `view()` to get the underlying GPUTextureView when building render passes.
 */
export class RenderTarget {
    readonly _inner: GPUTextureView;
    private _format: TextureFormat;

    constructor(view: GPUTextureView, format: TextureFormat) {
        this._inner = view;
        this._format = format;
    }

    get format(): TextureFormat
    {
        return this._format;
    }
}

/**
 * Builder for creating a `RenderTarget` from a `Texture`.
 *
 * The builder produces a GPUTextureView configured with a sensible default
 * descriptor and wraps it in a `RenderTarget` helper.
 */
export class RenderTargetBuilder {
    private _texture: Texture;
    private _baseMipLevel = 0;
    private _baseArrayLayer = 0;

    /**
     * Create a new RenderTargetBuilder for the given texture. This should only be called
     * from the TinyHelix instance (see {@link TinyHelix.createRenderTarget}).
     * @param texture
     *
     * @internal
     */
    constructor(texture: Texture) {
        this._texture = texture;
    }

    /**
     * Set the base mip level to use for the render target. Defaults to 0.
     */
    withMipLevel(level: number): this {
        this._baseMipLevel = level;
        return this;
    }

    /**
     * Set the base array layer to use for the render target. Defaults to 0.
     */
    withArrayLayer(layer: number): this {
        this._baseArrayLayer = layer;
        return this;
    }

    /**
     * Create and return a new `RenderTarget` instance.
     */
    build(): RenderTarget {
        const tex = this._texture._inner;
        const view = this._texture._inner.createView({
            format: tex.format,
            dimension: tex.dimension,
            aspect: 'all',
            baseMipLevel: this._baseMipLevel,
            mipLevelCount: 1,
            baseArrayLayer: this._baseArrayLayer,
            arrayLayerCount: 1,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        return new RenderTarget(view, this._texture.format);
    }
}
