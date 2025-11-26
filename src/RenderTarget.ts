import {Texture} from "./Texture";

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
    withMipLevel(level: number): RenderTargetBuilder {
        this._baseMipLevel = level;
        return this;
    }

    /**
     * Set the base array layer to use for the render target. Defaults to 0.
     */
    withArrayLayer(layer: number): RenderTargetBuilder {
        this._baseArrayLayer = layer;
        return this;
    }

    /**
     * Create and return a new `RenderTarget` instance.
     */
    build(): RenderTarget {
        const tex = this._texture.inner;
        const desc: GPUTextureViewDescriptor = {
            format: tex.format,
            dimension: tex.dimension,
            aspect: 'all',
            baseMipLevel: this._baseMipLevel,
            mipLevelCount: 1,
            baseArrayLayer: this._baseArrayLayer,
            arrayLayerCount: 1
        }
        return new RenderTarget(this._texture.inner.createView(desc));
    }
}

/**
 * Lightweight wrapper around a GPUTextureView representing a render target.
 * Use `view()` to get the underlying GPUTextureView when building render passes.
 */
export class RenderTarget {
    private _inner: GPUTextureView;

    constructor(view: GPUTextureView) {
        this._inner = view;
    }

    /**
     * The GPUTextureView for this render target.
     * @internal
     */
    get inner(): GPUTextureView {
        return this._inner;
    }
}