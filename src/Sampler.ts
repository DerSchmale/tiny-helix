import {WebGPUContext} from "./WebGPUContext";
import {AddressMode, FilterMode} from "./enums";

export class Sampler {
    readonly _inner: GPUSampler;

    private static DEFAULT_TRILINEAR: Sampler;

    constructor(inner: GPUSampler) {
        this._inner = inner;
    }
}

export class SamplerBuilder {
    private _ctx: WebGPUContext;
    private _addressModeU?: GPUAddressMode;
    private _addressModeV?: GPUAddressMode;
    private _addressModeW?: GPUAddressMode;
    private _minFilter?: GPUFilterMode;
    private _magFilter?: GPUFilterMode;
    private _mipmapFilter?: GPUFilterMode;
    private _minMipLevel?: number;
    private _maxMipLevel?: number;
    private _maxAnisotropy?: number;
    private _compare?: GPUCompareFunction;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withAddressMode(u: AddressMode, v?: AddressMode, w?: AddressMode): this
    {
        this._addressModeU = u;
        this._addressModeV = v ?? u;
        this._addressModeW = w ?? u;
        return this;
    }

    withFiltering(minFilter: FilterMode, magFilter?: FilterMode, mipmapFilter?: FilterMode): this
    {
        this._minFilter = minFilter;
        this._magFilter = magFilter ?? minFilter;
        this._mipmapFilter = mipmapFilter ?? minFilter;
        return this;
    }

    withTrilinearFiltering(): this
    {
        this.withFiltering(FilterMode.Linear);
        return this;
    }

    withNearestFiltering(): this
    {
        this.withFiltering(FilterMode.Nearest);
        return this;
    }

    withAnisotropicFiltering(maxAnisotropy: number): this
    {
        this.withFiltering(FilterMode.Linear);
        this._maxAnisotropy = maxAnisotropy;
        return this;
    }

    withMinMipLevel(level: number): this
    {
        this._minMipLevel = level;
        return this;
    }

    withMaxMipLevel(level: number): this
    {
        this._maxMipLevel = level;
        return this;
    }

    withCompareFunction(compare: GPUCompareFunction): this
    {
        this._compare = compare;
        return this;
    }

    build(): Sampler
    {
        return new Sampler(this._ctx.device.createSampler({
            addressModeU: this._addressModeU,
            addressModeV: this._addressModeV,
            addressModeW: this._addressModeW,
            magFilter: this._magFilter,
            minFilter: this._minFilter,
            mipmapFilter: this._mipmapFilter,
            lodMinClamp: this._minMipLevel,
            lodMaxClamp: this._maxMipLevel,
            compare: this._compare,
            maxAnisotropy: this._maxAnisotropy
        }));
    }
}