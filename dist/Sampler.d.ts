/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { AddressMode, FilterMode } from "./enums";
export declare class Sampler {
    readonly _inner: GPUSampler;
    private static DEFAULT_TRILINEAR;
    constructor(inner: GPUSampler);
}
export declare class SamplerBuilder {
    private _ctx;
    private _addressModeU?;
    private _addressModeV?;
    private _addressModeW?;
    private _minFilter?;
    private _magFilter?;
    private _mipmapFilter?;
    private _minMipLevel?;
    private _maxMipLevel?;
    private _maxAnisotropy?;
    private _compare?;
    constructor(ctx: WebGPUContext);
    withAddressMode(u: AddressMode, v?: AddressMode, w?: AddressMode): this;
    withFiltering(minFilter: FilterMode, magFilter?: FilterMode, mipmapFilter?: FilterMode): this;
    withTrilinearFiltering(): this;
    withNearestFiltering(): this;
    withAnisotropicFiltering(maxAnisotropy: number): this;
    withMinMipLevel(level: number): this;
    withMaxMipLevel(level: number): this;
    withCompareFunction(compare: GPUCompareFunction): this;
    build(): Sampler;
}
