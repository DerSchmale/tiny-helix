/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { TextureDimension, TextureFormat, TextureViewDimension } from "./enums";
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
    private _ctx;
    private _mipper?;
    /**
     * @internal
     */
    static from_webgpu(texture: GPUTexture, format: TextureFormat, ctx: WebGPUContext, mipShader?: GPUShaderModule): Texture;
    constructor(inner: GPUTexture, format: TextureFormat, ctx: WebGPUContext, mipShader?: GPUShaderModule);
    createView(): TextureViewBuilder;
    get format(): TextureFormat;
    get mipLevelCount(): number;
    get width(): number;
    get height(): number;
    get depthOrArrayLayers(): number;
    _getBufferResource(): GPUBindingResource;
    uploadImage(data: ImageBitmap, mipLevel?: number): void;
    uploadData(data: GPUAllowSharedBufferSource, mipLevel?: number): void;
    generateMipmaps(): void;
    dimension(): TextureDimension;
}
export declare class TextureBuilder {
    private _ctx;
    private _size;
    private _data?;
    private _format;
    private _usage;
    private _dimension;
    private _mipLevelCount;
    private _generateMips;
    private _mipShader;
    constructor(ctx: WebGPUContext, mipShader: GPUShaderModule);
    withSize(width: number, height: number, depthOrArrayLayers?: number): this;
    withDimension(dim: TextureDimension): this;
    withMipLevels(count?: number): this;
    withFormat(format: TextureFormat): this;
    withData(data: GPUAllowSharedBufferSource, mipLevel?: number): this;
    withImage(data: ImageBitmap, mipLevel?: number): this;
    withGeneratedMipmaps(): this;
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
    withUsage(usage: TextureUsage): this;
    withSingleMip(level: number): this;
    withMipRange(start: number, end: number): this;
    withSingleLayer(layer: number): this;
    withLayerRange(start: number, end: number): this;
    withDimension(dim: TextureViewDimension): this;
    build(): TextureView;
}
