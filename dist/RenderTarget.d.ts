/// <reference types="@webgpu/types" />
import { Texture } from "./Texture";
/**
 * Lightweight wrapper around a GPUTextureView representing a render target.
 * Use `view()` to get the underlying GPUTextureView when building render passes.
 */
export declare class RenderTarget {
    readonly _inner: GPUTextureView;
    constructor(view: GPUTextureView);
}
/**
 * Builder for creating a `RenderTarget` from a `Texture`.
 *
 * The builder produces a GPUTextureView configured with a sensible default
 * descriptor and wraps it in a `RenderTarget` helper.
 */
export declare class RenderTargetBuilder {
    private _texture;
    private _baseMipLevel;
    private _baseArrayLayer;
    /**
     * Create a new RenderTargetBuilder for the given texture. This should only be called
     * from the TinyHelix instance (see {@link TinyHelix.createRenderTarget}).
     * @param texture
     *
     * @internal
     */
    constructor(texture: Texture);
    /**
     * Set the base mip level to use for the render target. Defaults to 0.
     */
    withMipLevel(level: number): this;
    /**
     * Set the base array layer to use for the render target. Defaults to 0.
     */
    withArrayLayer(layer: number): this;
    /**
     * Create and return a new `RenderTarget` instance.
     */
    build(): RenderTarget;
}
