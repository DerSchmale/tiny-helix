/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { TextureFormat } from "./enums";
import { IBuffer } from "./buffers/IBuffer";
/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
export declare class Texture implements IBuffer {
    /** @internal */
    readonly _inner: GPUTexture;
    /**
     * Create a Texture wrapper from an existing GPUTexture.
     * @param texture - The underlying GPUTexture
     */
    static from_webgpu(texture: GPUTexture): Texture;
    constructor(inner: GPUTexture);
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
    withUsage(usage: GPUTextureUsageFlags): this;
    build(): Texture;
}
