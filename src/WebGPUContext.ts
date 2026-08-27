import {ColorSpace, TextureFormat} from "./enums";

/**
 * Options for initializing WebGPU context
 */
export interface WebGPUContextOptions {
    /** The canvas element to render to */
    canvas?: HTMLCanvasElement;
    /** Power preference for adapter selection */
    powerPreference?: GPUPowerPreference;
    /** Required features for the device */
    requiredFeatures?: GPUFeatureName[];
    /** Required limits for the device */
    requiredLimits?: Record<string, number>;
    colorSpace?: ColorSpace;
}

/**
 * Manages WebGPU adapter, device, and context initialization
 */
export class WebGPUContext {
    private _adapter: GPUAdapter | null = null;
    private _device: GPUDevice | null = null;
    private _context: GPUCanvasContext | null = null;
    private _format: TextureFormat = TextureFormat.Rgba8UnormSrgb;
    private _canvas: HTMLCanvasElement | null = null;
    private _colorSpace: ColorSpace = ColorSpace.sRGB;

    /**
     * Gets the WebGPU adapter. Throws if not initialized.
     */
    get adapter(): GPUAdapter {
        return this._adapter!;
    }

    /**
     * Gets the WebGPU device. Throws if not initialized.
     */
    get device(): GPUDevice {
        return this._device!;
    }

    /**
     * Gets the GPU canvas context. Throws if no canvas was configured.
     */
    get context(): GPUCanvasContext {
        return this._context!;
    }

    /**
     * Gets the preferred texture format used by the configured canvas/context.
     */
    get format(): TextureFormat {
        return this._format;
    }

    /**
     * Gets the color space used by the configured canvas/context.
     */
    get colorSpace(): ColorSpace
    {
        return this._colorSpace;
    }

    /**
     * Gets the configured canvas element. Throws if none was provided during initialization.
     */
    get canvas(): HTMLCanvasElement {
        return this._canvas!;
    }

    /**
     * Checks if WebGPU is supported in the current environment.
     */
    static isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'gpu' in navigator;
    }

    /**
     * Initializes the WebGPU context and device.
     * @param options - Configuration options such as canvas and adapter preferences
     * @throws Error if WebGPU is not supported or initialization fails
     */
    async initialize(options: WebGPUContextOptions = {}) {
        if (!WebGPUContext.isSupported()) {
            throw new Error('WebGPU is not supported in this browser');
        }

        // Request adapter
        this._adapter = await navigator.gpu.requestAdapter({
            powerPreference: options.powerPreference ?? 'high-performance',
        });

        if (!this._adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }

        // Request device
        this._device = await this._adapter.requestDevice({
            requiredFeatures: options.requiredFeatures,
            requiredLimits: options.requiredLimits,
        });

        if (!this._device) {
            throw new Error('Failed to get WebGPU device');
        }

        // Setup error handling
        this._device.lost.then((info: GPUDeviceLostInfo) => {
            console.error("WebGPU device lost:", info.message, "\nReason:", info.reason);

            if (info.reason !== "destroyed") {
                // Attempt to reinitialize
                this.initialize(options).catch((error) => {
                    console.error("Failed to reinitialize WebGPU context:", error);
                });
            }
        });

        // Configure canvas context if provided
        if (options.canvas) {
            this._canvas = options.canvas;
            this._context = this._canvas.getContext("webgpu") as GPUCanvasContext;

            if (!this._context) {
                throw new Error("Failed to get WebGPU context from canvas");
            }

            const canUseP3 = window.matchMedia("(color-gamut: p3)").matches;
            this._colorSpace = options.colorSpace ?? ColorSpace.sRGB;
            if (this._colorSpace === ColorSpace.DisplayP3 && !canUseP3) {
                this._colorSpace = ColorSpace.sRGB;
                console.warn("DisplayP3 not supported, falling back to sRGB");
            }

            this._format = navigator.gpu.getPreferredCanvasFormat() as TextureFormat;
            this._context.configure({
                device: this._device,
                format: this._format,
                colorSpace: this._colorSpace,
                alphaMode: "premultiplied",
            });
        }
        else {
            console.warn("No canvas provided!");
        }
    }

    /**
     * Internal helper to fetch the current swapchain texture.
     * @internal
     */
    getCurrentTexture(): GPUTexture {
        return this._context!.getCurrentTexture();
    }

    /**
     * Destroys the WebGPU context and releases resources
     */
    destroy(): void {
        if (this._device) {
            this._device.destroy();
            this._device = null;
        }
        this._adapter = null;
        this._context = null;
        this._canvas = null;
    }
}
