import { WebGPUContext } from './WebGPUContext';
/**
 * Basic WebGPU renderer for managing render passes
 */
export declare class Renderer {
    private _context;
    private _clearColor;
    /**
     * Creates a new Renderer instance
     * @param context - The WebGPU context to render with
     */
    constructor(context: WebGPUContext);
    /**
     * Gets the WebGPU context
     */
    get context(): WebGPUContext;
    /**
     * Gets or sets the clear color
     */
    get clearColor(): GPUColor;
    set clearColor(color: GPUColor);
    /**
     * Begins a new render frame and returns a command encoder
     * @returns The command encoder for this frame
     * @throws Error if device or context is not available
     */
    beginFrame(): GPUCommandEncoder;
    /**
     * Creates a render pass for the current frame
     * @param commandEncoder - The command encoder to use
     * @returns The render pass encoder
     * @throws Error if context is not configured
     */
    beginRenderPass(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder;
    /**
     * Ends the current frame and submits commands
     * @param commandEncoder - The command encoder to submit
     */
    endFrame(commandEncoder: GPUCommandEncoder): void;
    /**
     * Clears the canvas with the current clear color
     */
    clear(): void;
}
