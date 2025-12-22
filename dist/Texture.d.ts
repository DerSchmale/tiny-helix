/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { TextureFormat } from "./enums";
import { IBuffer } from "./buffers/IBuffer";
import { TextureUsage } from "./buffers/Buffer";
/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
export declare class Texture implements IBuffer {
    /** @internal */
    readonly _inner: GPUTexture;
    private _format;
    /**
     * Create a Texture wrapper from an existing GPUTexture.
     * @param texture - The underlying GPUTexture
     */
    static from_webgpu(texture: GPUTexture, format: TextureFormat): Texture;
    constructor(inner: GPUTexture, format: TextureFormat);
    createView(): TextureViewBuilder;
    get format(): TextureFormat;
    _getBufferResource(): GPUBindingResource;
}
export declare class TextureBuilder {
    private _ctx;
    private _size;
    private _data;
    private _format;
    private _usage;
    constructor(ctx: WebGPUContext);
    withSize(width: number, height: number, depthOrArrayLayers?: number): this;
    withData(data: GPUAllowSharedBufferSource): this;
    withFormat(format: TextureFormat): this;
    withImage(data: ImageBitmap): this;
    withUsage(usage: TextureUsage): this;
    build(): Texture;
}
export declare class TextureView {
    /** @internal */
    _inner: GPUTextureView;
    constructor(inner: GPUTextureView);
}
export declare class TextureViewBuilder {
    private _texture;
    private _desc;
    /**
     * @internal
     */
    constructor(texture: Texture);
    withSingleMip(level: number): this;
    withMipRange(start: number, end: number): this;
    withSingleLayer(layer: number): this;
    withLayerRange(start: number, end: number): this;
    build(): TextureView;
}
