import {WebGPUContext} from "./WebGPUContext";
import {TextureDimension, TextureFormat, TextureViewDimension} from "./enums";
import {IBuffer} from "./buffers/IBuffer";
import {TextureUsage} from "./buffers/Buffer";
import {MipRenderer} from "./utils/MipRenderer";
import {mapUndefined} from "./utils/mapUndefined";

/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
export class Texture implements IBuffer {
    /** @internal */
    readonly _inner: GPUTexture;
    private _format: TextureFormat;
    private _ctx: WebGPUContext;
    private _mipper?: MipRenderer;

    /**
     * @internal
     */
    static from_webgpu(texture: GPUTexture, format: TextureFormat, ctx: WebGPUContext, mipShader?: GPUShaderModule): Texture {
        return new Texture(texture, format, ctx, mipShader);
    }

    constructor(inner: GPUTexture, format: TextureFormat, ctx: WebGPUContext, mipShader?: GPUShaderModule) {
        this._inner = inner;
        this._format = format;
        this._ctx = ctx;
        this._mipper = mapUndefined(mipShader, (mipShader) => new MipRenderer(ctx, mipShader, this));
    }

    createView(): TextureViewBuilder {
        return new TextureViewBuilder(this);
    }

    get format(): TextureFormat {
        return this._format;
    }

    get mipLevelCount(): number {
        return this._inner.mipLevelCount;
    }

    get width(): number {
        return this._inner.width;
    }

    get height(): number {
        return this._inner.height;
    }

    get depthOrArrayLayers(): number {
        return this._inner.depthOrArrayLayers;
    }

    _getBufferResource(): GPUBindingResource {
        return this._inner.createView();
    }

    uploadImage(data: ImageBitmap, mipLevel: number = 0) {
        this._ctx.device.queue.copyExternalImageToTexture({source: data}, {texture: this._inner, mipLevel}, [data.width, data.height, 1]);
    }

    uploadData(data: GPUAllowSharedBufferSource, mipLevel: number = 0) {
        const width = Math.max(this._inner.width >> mipLevel, 1);
        const height = Math.max(this._inner.height >> mipLevel, 1);
        const depthOrArrayLayers = Math.max(this._inner.depthOrArrayLayers >> mipLevel, 1);
        const blockWidth = TextureUtils.getBlockWidth(this._format);
        const blocksPerRow = Math.ceil(width / blockWidth);
        const bytesPerRow = blocksPerRow * TextureUtils.bytesPerBlock(this._format);

        this._ctx.device.queue.writeTexture(
            {texture: this._inner, mipLevel},
            data,
            {
                bytesPerRow,
                rowsPerImage: height    // This is what Mario is asking for!
            },
            {width, height, depthOrArrayLayers}
        );
    }

    generateMipmaps() {
        if (this._inner.dimension !== TextureDimension.D2) {
            throw new Error('generateMipmaps currently only supports 2D textures.');
        }

        this._mipper!.render();
    }

    dimension(): TextureDimension {
        switch (this._inner.dimension) {
            case "1d":
                return TextureDimension.D1;
            case "2d":
                return TextureDimension.D2;
            case "3d":
                return TextureDimension.D3;
            default:
                throw new Error(`Unknown texture dimension: ${this._inner.dimension}`);
        }
    }
}

type TextureData = GPUAllowSharedBufferSource | ImageBitmap;

export class TextureBuilder {
    private _ctx: WebGPUContext;
    private _size: [number, number, number] = [1, 1, 1];
    private _data?: TextureData[];
    private _format: TextureFormat = TextureFormat.Rgba8UnormSrgb;
    private _usage: GPUTextureUsageFlags = GPUTextureUsage.TEXTURE_BINDING;
    private _dimension: TextureDimension = TextureDimension.D2;
    private _mipLevelCount: number = 1; // -1 will mean auto calculate based on size
    private _generateMips: boolean = false;
    private _mipShader: GPUShaderModule;

    constructor(ctx: WebGPUContext, mipShader: GPUShaderModule) {
        this._mipShader = mipShader;
        this._ctx = ctx;
    }

    withSize(width: number, height: number, depthOrArrayLayers: number = 1): this {
        this._size = [width, height, depthOrArrayLayers];
        if (depthOrArrayLayers > 1) {
            this._dimension = TextureDimension.D3;
        }
        return this;
    }

    withDimension(dim: TextureDimension): this {
        this._dimension = dim;
        return this;
    }

    withMipLevels(count?: number): this {
        this._mipLevelCount = count ?? -1;
        return this;
    }

    withFormat(format: TextureFormat): this {
        this._format = format;
        return this;
    }

    withData(data: GPUAllowSharedBufferSource, mipLevel: number = 0): this {
        this._data = this._data ?? [];
        this._data[mipLevel] = data;
        this._mipLevelCount = Math.max(this._mipLevelCount, mipLevel + 1);
        return this;
    }

    withImage(data: ImageBitmap, mipLevel: number = 0): this {
        this._data = this._data ?? [];
        this._data[mipLevel] = data;
        if (mipLevel === 0) {
            this._size = [data.width, data.height, 1];
        }

        this._mipLevelCount = Math.max(this._mipLevelCount, mipLevel + 1);

        return this;
    }

    withGeneratedMipmaps(): this {
        this._mipLevelCount = -1;
        this._generateMips = true;
        return this;
    }

    withUsage(usage: TextureUsage): this {
        this._usage |= usage;
        return this;
    }

    build(): Texture {
        if (this._data) {
            this._usage |= GPUTextureUsage.COPY_DST;
        }

        if (this._generateMips) {
            this._usage |= GPUTextureUsage.RENDER_ATTACHMENT;
        }

        if (this._mipLevelCount == -1) {
            const maxDimension = Math.max(this._size[0], this._size[1], this._size[2]);
            this._mipLevelCount = Math.floor(Math.log2(maxDimension)) + 1;
        }

        const inner = this._ctx.device.createTexture({
            format: this._format, size: this._size, usage: this._usage,
            dimension: this._dimension,
            mipLevelCount: this._mipLevelCount
        })

        const tex = new Texture(inner, this._format, this._ctx, this._generateMips? this._mipShader : undefined);

        if (this._data) {
            const mipCount = this._generateMips? 1 : this._mipLevelCount;

            for (let mipLevel = 0; mipLevel < mipCount; mipLevel++) {
                const data = this._data[mipLevel];
                if (!data) throw new Error(`TextureBuilder: Missing data for mip level ${mipLevel}`);

                if (data instanceof ImageBitmap) {
                    tex.uploadImage(data, mipLevel);
                } else {
                    tex.uploadData(data, mipLevel);
                }
            }

            if (this._generateMips) {
                // Generate mipmaps using a simple render pass approach
                tex.generateMipmaps();
            }
        }

        return tex;
    }
}

export class TextureView {
    /** @internal */
    _inner: GPUTextureView;

    constructor(inner: GPUTextureView) {
        this._inner = inner;
    }
}

export class TextureViewBuilder {
    private _texture: Texture;
    private _desc: GPUTextureViewDescriptor = {};

    /**
     * @internal
     */
    constructor(texture: Texture) {
        this._texture = texture;
    }

    withUsage(usage: TextureUsage): this {
        if (this._desc.usage === undefined) {
            this._desc.usage = 0;
        }

        this._desc.usage |= usage;
        return this;
    }

    withSingleMip(level: number): this {
        this._desc.baseMipLevel = level;
        this._desc.mipLevelCount = 1;
        return this;
    }

    withMipRange(start: number, end: number): this {
        this._desc.baseMipLevel = start;
        this._desc.mipLevelCount = end - start;
        return this;
    }

    withSingleLayer(layer: number): this {
        this._desc.baseArrayLayer = layer;
        this._desc.arrayLayerCount = 1;
        return this;
    }

    withLayerRange(start: number, end: number): this {
        this._desc.baseArrayLayer = start;
        this._desc.arrayLayerCount = end;
        return this;
    }

    withDimension(dim: TextureViewDimension): this {
        this._desc.dimension = dim;
        return this;
    }

    build(): TextureView {
        return new TextureView(this._texture._inner.createView(this._desc));
    }
}

export class TextureUtils {
    static isBc(format: TextureFormat): boolean {
        switch (format) {
            case TextureFormat.Bc1RgbaUnorm:
            case TextureFormat.Bc1RgbaUnormSrgb:
            case TextureFormat.Bc2RgbaUnorm:
            case TextureFormat.Bc2RgbaUnormSrgb:
            case TextureFormat.Bc3RgbaUnorm:
            case TextureFormat.Bc3RgbaUnormSrgb:
            case TextureFormat.Bc4RUnorm:
            case TextureFormat.Bc4RSnorm:
            case TextureFormat.Bc5RgUnorm:
            case TextureFormat.Bc5RgSnorm:
            case TextureFormat.Bc6hRgbUfloat:
            case TextureFormat.Bc6hRgbFloat:
            case TextureFormat.Bc7RgbaUnorm:
            case TextureFormat.Bc7RgbaUnormSrgb:
                return true;
            default:
                return false;
        }
    }

    static isEtc(format: TextureFormat): boolean {
        switch (format) {
            case TextureFormat.Etc2Rgb8Unorm:
            case TextureFormat.Etc2Rgb8UnormSrgb:
            case TextureFormat.Etc2Rgb8A1Unorm:
            case TextureFormat.Etc2Rgb8A1UnormSrgb:
            case TextureFormat.Etc2Rgba8Unorm:
            case TextureFormat.Etc2Rgba8UnormSrgb:
            case TextureFormat.EacR11Unorm:
            case TextureFormat.EacR11Snorm:
            case TextureFormat.EacRg11Unorm:
            case TextureFormat.EacRg11Snorm:
                return true;
            default:
                return false;
        }
    }

    static getBlockWidth(format: TextureFormat): number {
        if (TextureUtils.isBc(format) || TextureUtils.isEtc(format)) return 4;

        switch (format) {
            case TextureFormat.Astc4x4Unorm:
            case TextureFormat.Astc4x4UnormSrgb:
                return 4;
            case TextureFormat.Astc5x4Unorm:
            case TextureFormat.Astc5x4UnormSrgb:
            case TextureFormat.Astc5x5Unorm:
            case TextureFormat.Astc5x5UnormSrgb:
                return 5;
            case TextureFormat.Astc6x5Unorm:
            case TextureFormat.Astc6x5UnormSrgb:
            case TextureFormat.Astc6x6Unorm:
            case TextureFormat.Astc6x6UnormSrgb:
                return 6;
            case TextureFormat.Astc8x5Unorm:
            case TextureFormat.Astc8x5UnormSrgb:
            case TextureFormat.Astc8x6Unorm:
            case TextureFormat.Astc8x6UnormSrgb:
            case TextureFormat.Astc8x8Unorm:
            case TextureFormat.Astc8x8UnormSrgb:
                return 8;
            case TextureFormat.Astc10x5Unorm:
            case TextureFormat.Astc10x5UnormSrgb:
            case TextureFormat.Astc10x6Unorm:
            case TextureFormat.Astc10x6UnormSrgb:
            case TextureFormat.Astc10x8Unorm:
            case TextureFormat.Astc10x8UnormSrgb:
            case TextureFormat.Astc10x10Unorm:
            case TextureFormat.Astc10x10UnormSrgb:
                return 10;
            case TextureFormat.Astc12x10Unorm:
            case TextureFormat.Astc12x10UnormSrgb:
            case TextureFormat.Astc12x12Unorm:
            case TextureFormat.Astc12x12UnormSrgb:
                return 12;
            default:
                return 1;
        }
    }

    /**
     * Returns the number of bytes in a compressed or uncompressed block for the
     * given texture format. Matches the mapping from the Rust implementation and
     * throws for unsupported formats.
     */
    static bytesPerBlock(format: TextureFormat): number {
        switch (format) {
            // 1-byte formats
            case TextureFormat.R8Unorm:
            case TextureFormat.R8Snorm:
            case TextureFormat.R8Uint:
            case TextureFormat.R8Sint:
            case TextureFormat.Stencil8:
                return 1;

            // 2-byte formats
            case TextureFormat.R16Uint:
            case TextureFormat.R16Sint:
            case TextureFormat.R16Unorm:
            case TextureFormat.R16Snorm:
            case TextureFormat.R16Float:
            case TextureFormat.RG8Unorm:
            case TextureFormat.RG8Snorm:
            case TextureFormat.RG8Uint:
            case TextureFormat.RG8Sint:
            case TextureFormat.Depth16Unorm:
                return 2;

            // 4-byte formats
            case TextureFormat.R32Uint:
            case TextureFormat.R32Sint:
            case TextureFormat.R32Float:
            case TextureFormat.RG16Uint:
            case TextureFormat.RG16Sint:
            case TextureFormat.RG16Unorm:
            case TextureFormat.RG16Snorm:
            case TextureFormat.RG16Float:
            case TextureFormat.Rgba8Unorm:
            case TextureFormat.Rgba8UnormSrgb:
            case TextureFormat.Rgba8Snorm:
            case TextureFormat.Rgba8Uint:
            case TextureFormat.Rgba8Sint:
            case TextureFormat.Bgra8Unorm:
            case TextureFormat.Bgra8UnormSrgb:
            case TextureFormat.Rgb9e5Ufloat:
            case TextureFormat.Rgb10a2Uint:
            case TextureFormat.Rgb10a2Unorm:
            case TextureFormat.Depth24Plus:
            case TextureFormat.Depth24PlusStencil8:
            case TextureFormat.Depth32Float:
                return 4;

            // 8-byte formats
            case TextureFormat.Rg11b10Ufloat:
            case TextureFormat.RG32Uint:
            case TextureFormat.RG32Sint:
            case TextureFormat.RG32Float:
            case TextureFormat.Rgba16Uint:
            case TextureFormat.Rgba16Sint:
            case TextureFormat.Rgba16Unorm:
            case TextureFormat.Rgba16Snorm:
            case TextureFormat.Rgba16Float:
            case TextureFormat.Depth32FloatStencil8:
            case TextureFormat.Bc1RgbaUnorm:
            case TextureFormat.Bc1RgbaUnormSrgb:
            case TextureFormat.Bc4RUnorm:
            case TextureFormat.Bc4RSnorm:
            case TextureFormat.Etc2Rgb8Unorm:
            case TextureFormat.Etc2Rgb8UnormSrgb:
            case TextureFormat.Etc2Rgb8A1Unorm:
            case TextureFormat.Etc2Rgb8A1UnormSrgb:
            case TextureFormat.EacR11Unorm:
            case TextureFormat.EacR11Snorm:
                return 8;

            // 16-byte formats
            case TextureFormat.Rgba32Uint:
            case TextureFormat.Rgba32Sint:
            case TextureFormat.Rgba32Float:
            case TextureFormat.Bc2RgbaUnorm:
            case TextureFormat.Bc2RgbaUnormSrgb:
            case TextureFormat.Bc3RgbaUnorm:
            case TextureFormat.Bc3RgbaUnormSrgb:
            case TextureFormat.Bc5RgUnorm:
            case TextureFormat.Bc5RgSnorm:
            case TextureFormat.Bc6hRgbUfloat:
            case TextureFormat.Bc6hRgbFloat:
            case TextureFormat.Bc7RgbaUnorm:
            case TextureFormat.Bc7RgbaUnormSrgb:
            case TextureFormat.Etc2Rgba8Unorm:
            case TextureFormat.Etc2Rgba8UnormSrgb:
            case TextureFormat.EacRg11Unorm:
            case TextureFormat.EacRg11Snorm:
            case TextureFormat.Astc4x4Unorm:
            case TextureFormat.Astc4x4UnormSrgb:
            case TextureFormat.Astc5x4Unorm:
            case TextureFormat.Astc5x4UnormSrgb:
            case TextureFormat.Astc5x5Unorm:
            case TextureFormat.Astc5x5UnormSrgb:
            case TextureFormat.Astc6x5Unorm:
            case TextureFormat.Astc6x5UnormSrgb:
            case TextureFormat.Astc6x6Unorm:
            case TextureFormat.Astc6x6UnormSrgb:
            case TextureFormat.Astc8x5Unorm:
            case TextureFormat.Astc8x5UnormSrgb:
            case TextureFormat.Astc8x6Unorm:
            case TextureFormat.Astc8x6UnormSrgb:
            case TextureFormat.Astc8x8Unorm:
            case TextureFormat.Astc8x8UnormSrgb:
            case TextureFormat.Astc10x5Unorm:
            case TextureFormat.Astc10x5UnormSrgb:
            case TextureFormat.Astc10x6Unorm:
            case TextureFormat.Astc10x6UnormSrgb:
            case TextureFormat.Astc10x8Unorm:
            case TextureFormat.Astc10x8UnormSrgb:
            case TextureFormat.Astc10x10Unorm:
            case TextureFormat.Astc10x10UnormSrgb:
            case TextureFormat.Astc12x10Unorm:
            case TextureFormat.Astc12x10UnormSrgb:
            case TextureFormat.Astc12x12Unorm:
            case TextureFormat.Astc12x12UnormSrgb:
            case TextureFormat.Bc2RgbaUnorm:
                // NOTE: Bc2RgbaUnorm is already listed above; duplicate entries are
                // harmless but kept out of caution when mapping from Rust.
                return 16;

            default:
                throw new Error(`Unsupported texture format: ${format}`);
        }
    }
}