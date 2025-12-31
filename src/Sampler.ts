import {WebGPUContext} from "./WebGPUContext";
import {AddressMode, CompareFunction, FilterMode} from "./enums";

export class Sampler {
    readonly _inner: GPUSampler;

    private static DEFAULT_TRILINEAR: Sampler;

    constructor(inner: GPUSampler) {
        this._inner = inner;
    }
}

export class SamplerBuilder {
    private _ctx: WebGPUContext;
    private _desc: GPUSamplerDescriptor = {};

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withLabel(label: string): this
    {
        this._desc.label = label;
        return this;
    }

    withAddressMode(u: AddressMode, v?: AddressMode, w?: AddressMode): this
    {
        this._desc.addressModeU = u;
        this._desc.addressModeV = v ?? u;
        this._desc.addressModeW = w ?? u;
        return this;
    }

    withFiltering(minFilter: FilterMode, magFilter?: FilterMode, mipmapFilter?: FilterMode): this
    {
        this._desc.minFilter = minFilter;
        this._desc.magFilter = magFilter ?? minFilter;
        this._desc.mipmapFilter = mipmapFilter ?? minFilter;
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
        this._desc.maxAnisotropy = maxAnisotropy;
        return this;
    }

    withMinMipLevel(level: number): this
    {
        this._desc.lodMinClamp = level;
        return this;
    }

    withMaxMipLevel(level: number): this
    {
        this._desc.lodMaxClamp = level;
        return this;
    }

    withCompareFunction(compare: CompareFunction): this
    {
        this._desc.compare = compare;
        return this;
    }

    build(): Sampler
    {
        return new Sampler(this._ctx.device.createSampler(this._desc));
    }
}