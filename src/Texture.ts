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

    private constructor(inner: GPUTexture) {
        this._inner = inner;
    }
}