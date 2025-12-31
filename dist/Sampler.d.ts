/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { AddressMode, CompareFunction, FilterMode } from "./enums";
export declare class Sampler {
    readonly _inner: GPUSampler;
    private static DEFAULT_TRILINEAR;
    constructor(inner: GPUSampler);
}
export declare class SamplerBuilder {
    private _ctx;
    private _desc;
    constructor(ctx: WebGPUContext);
    withLabel(label: string): this;
    withAddressMode(u: AddressMode, v?: AddressMode, w?: AddressMode): this;
    withFiltering(minFilter: FilterMode, magFilter?: FilterMode, mipmapFilter?: FilterMode): this;
    withTrilinearFiltering(): this;
    withNearestFiltering(): this;
    withAnisotropicFiltering(maxAnisotropy: number): this;
    withMinMipLevel(level: number): this;
    withMaxMipLevel(level: number): this;
    withCompareFunction(compare: CompareFunction): this;
    build(): Sampler;
}
