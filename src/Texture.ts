import {WebGPUContext} from "./WebGPUContext";
import {TextureFormat} from "./enums";

/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
export class Texture {
    /** @internal */
    readonly _inner: GPUTexture;

    /**
     * Create a Texture wrapper from an existing GPUTexture.
     * @param texture - The underlying GPUTexture
     */
    static from_webgpu(texture: GPUTexture): Texture {
        return new Texture(texture);
    }

    constructor(inner: GPUTexture) {
        this._inner = inner;
    }
}

export class TextureBuilder {
    private _ctx: WebGPUContext;
    private _size: [number, number, number] = [1, 1, 1];
    private _data: ImageBitmap | GPUAllowSharedBufferSource | undefined = undefined;
    private _format: TextureFormat = TextureFormat.Rgba8UnormSrgb;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withSize(width: number, height: number, depthOrArrayLayers: number = 1): this {
        this._size = [width, height, depthOrArrayLayers];
        return this;
    }

    withData(data: GPUAllowSharedBufferSource): this {
        this._data = data;
        return this;
    }

    withFormat(format: TextureFormat): this {
        this._format = format;
        return this;
    }

    withImage(data: ImageBitmap): this {
        this._data = data;
        this._size = [data.width, data.height, 1];
        return this;
    }

    build(): Texture {
        let usage = GPUTextureUsage.TEXTURE_BINDING;
        if (this._data) {
            usage |= GPUTextureUsage.COPY_DST;
        }
        const inner = this._ctx.device.createTexture({
            format: this._format, size: this._size, usage
        })
        if (this._data instanceof ImageBitmap) {
            this._ctx.device.queue.copyExternalImageToTexture({source: this._data!}, {texture: inner}, [this._size[0], this._size[1], 1]);
        } else if (this._data) {
            const [width, height, depthOrArrayLayers] = this._size;
            const blockWidth = getBlockWidth(this._format);
            const blocksPerRow = Math.ceil(width / blockWidth);
            const bytesPerRow = blocksPerRow * bytesPerBlock(this._format);
            this._ctx.device.queue.writeTexture(
                {texture: inner},
                this._data,
                {bytesPerRow},
                {width, height, depthOrArrayLayers}
            );
        }
        return new Texture(inner);
    }
}

function isBc(format: GPUTextureFormat): boolean {
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
        default: return false;
    }
}

function isEtc(format: GPUTextureFormat): boolean {
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

function getBlockWidth(format: GPUTextureFormat): number {
    if (isBc(format) || isEtc(format)) return 4;

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
function bytesPerBlock(format: GPUTextureFormat): number {
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
