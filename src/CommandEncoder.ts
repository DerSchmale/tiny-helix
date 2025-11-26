import {WebGPUContext} from "./WebGPUContext";
import {RenderPassBuilder} from "./RenderPass";
import {RenderTarget} from "./RenderTarget";

/**
 * Encapsulates a GPUCommandEncoder and provides helper methods to build and
 * submit GPU commands for a single frame. CommandEncoder should only be created
 * through the TinyHelix instance (See {@link TinyHelix.createCommandEncoder})
 */
export class CommandEncoder {
    private _encoder: GPUCommandEncoder;
    private _queue: GPUQueue;
    private _backbufferTarget: RenderTarget;
    private _commandBuffer: GPUCommandBuffer | null = null;

    /**
     * Create a new CommandEncoder bound to a backbuffer/render target and
     * the WebGPU context.
     * @param backbufferTarget - The default render target for render passes
     * @param ctx - The WebGPU context providing device and queue
     * @param label - Optional debug label for the underlying GPUCommandEncoder
     *
     * @internal
     */
    constructor(backbufferTarget: RenderTarget, ctx: WebGPUContext, label?: string) {
        const device = ctx.device;
        this._queue = device.queue;
        this._backbufferTarget = backbufferTarget;
        this._encoder = device.createCommandEncoder({label});
    }

    /**
     * Begin building a render pass attached to this encoder.
     * Returns a fluent RenderPassBuilder used to configure attachments and clear ops.
     */
    createRenderPass(): RenderPassBuilder {
        return new RenderPassBuilder(this._encoder, this._backbufferTarget);
    }

    /**
     * Mark the encoder as finished and finalize any pending commands.
     * Calling finish() multiple times is safe but a no-op after the first call.
     */
    finish() {
        if (!this._commandBuffer) {
            this._commandBuffer = this._encoder.finish();
        }
    }

    /**
     * Submit the recorded commands to the GPU queue. If the encoder has not
     * been finished yet, finish() will be called automatically.
     */
    submit() {
        this.finish();
        this._queue.submit([this._commandBuffer!]);
    }
}