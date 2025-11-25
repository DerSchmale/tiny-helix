import { WebGPUContext } from './WebGPUContext';

/**
 * Basic WebGPU renderer for managing render passes
 */
export class Renderer {
  private _context: WebGPUContext;
  private _clearColor: GPUColor = { r: 0, g: 0, b: 0, a: 1 };

  /**
   * Creates a new Renderer instance
   * @param context - The WebGPU context to render with
   */
  constructor(context: WebGPUContext) {
    this._context = context;
  }

  /**
   * Gets the WebGPU context
   */
  get context(): WebGPUContext {
    return this._context;
  }

  /**
   * Gets or sets the clear color
   */
  get clearColor(): GPUColor {
    return this._clearColor;
  }

  set clearColor(color: GPUColor) {
    this._clearColor = color;
  }

  /**
   * Begins a new render frame and returns a command encoder
   * @returns The command encoder for this frame
   * @throws Error if device or context is not available
   */
  beginFrame(): GPUCommandEncoder {
    const device = this._context.device;
    if (!device) {
      throw new Error('WebGPU device not initialized');
    }

    return device.createCommandEncoder();
  }

  /**
   * Creates a render pass for the current frame
   * @param commandEncoder - The command encoder to use
   * @returns The render pass encoder
   * @throws Error if context is not configured
   */
  beginRenderPass(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder {
    const context = this._context.context;
    if (!context) {
      throw new Error('Canvas context not configured');
    }

    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: this._clearColor,
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    return commandEncoder.beginRenderPass(renderPassDescriptor);
  }

  /**
   * Ends the current frame and submits commands
   * @param commandEncoder - The command encoder to submit
   */
  endFrame(commandEncoder: GPUCommandEncoder): void {
    const device = this._context.device;
    if (!device) {
      throw new Error('WebGPU device not initialized');
    }

    device.queue.submit([commandEncoder.finish()]);
  }

  /**
   * Clears the canvas with the current clear color
   */
  clear(): void {
    const encoder = this.beginFrame();
    const pass = this.beginRenderPass(encoder);
    pass.end();
    this.endFrame(encoder);
  }
}
