/// <reference types="@webgpu/types" />
import { ColorSpace, TextureFormat } from "./enums";
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
export declare class WebGPUContext {
    private _adapter;
    private _device;
    private _context;
    private _format;
    private _canvas;
    private _colorSpace;
    /**
     * Gets the WebGPU adapter. Throws if not initialized.
     */
    get adapter(): GPUAdapter;
    /**
     * Gets the WebGPU device. Throws if not initialized.
     */
    get device(): GPUDevice;
    /**
     * Gets the GPU canvas context. Throws if no canvas was configured.
     */
    get context(): GPUCanvasContext;
    /**
     * Gets the preferred texture format used by the configured canvas/context.
     */
    get format(): TextureFormat;
    /**
     * Gets the color space used by the configured canvas/context.
     */
    get colorSpace(): ColorSpace;
    /**
     * Gets the configured canvas element. Throws if none was provided during initialization.
     */
    get canvas(): HTMLCanvasElement;
    /**
     * Checks if WebGPU is supported in the current environment.
     */
    static isSupported(): boolean;
    /**
     * Initializes the WebGPU context and device.
     * @param options - Configuration options such as canvas and adapter preferences
     * @throws Error if WebGPU is not supported or initialization fails
     */
    initialize(options?: WebGPUContextOptions): Promise<void>;
    /**
     * Internal helper to fetch the current swapchain texture.
     * @internal
     */
    getCurrentTexture(): GPUTexture;
    /**
     * Destroys the WebGPU context and releases resources
     */
    destroy(): void;
}
