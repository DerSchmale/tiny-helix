import { WebGPUContext } from "./WebGPUContext";
import { RenderPassBuilder } from "./RenderPass";
import { RenderTarget } from "./RenderTarget";
import { ComputePassBuilder } from "./ComputePass";
import { BindGroup } from "./BindGroup";
/**
 * Encapsulates a GPUCommandEncoder and provides helper methods to build and
 * submit GPU commands for a single frame. CommandEncoder should only be created
 * through the TinyHelix instance (See {@link TinyHelix.createCommandEncoder})
 */
export declare class CommandEncoder {
    private _encoder;
    private _queue;
    private _backbufferTarget;
    private _commandBuffer;
    private _depthStencilTarget;
    private _globalBindGroups;
    /**
     * Create a new CommandEncoder bound to a backbuffer/render target and
     * the WebGPU context.
     *
     * @internal
     */
    constructor(backbufferTarget: RenderTarget, globalBindGroups: BindGroup[], ctx: WebGPUContext, depthStencilTarget?: RenderTarget, label?: string);
    /**
     * Begin building a render pass attached to this encoder.
     * Returns a fluent RenderPassBuilder used to configure attachments and clear ops.
     */
    createRenderPass(): RenderPassBuilder;
    /**
     * Begin building a compute pass attached to this encoder.
     * Returns a fluent ComputePassBuilder used to configure bindings and dispatch ops.
     */
    createComputePass(): ComputePassBuilder;
    /**
     * Mark the encoder as finished and finalize any pending commands.
     * Calling finish() multiple times is safe but a no-op after the first call.
     */
    finish(): void;
    /**
     * Submit the recorded commands to the GPU queue. If the encoder has not
     * been finished yet, finish() will be called automatically.
     */
    submit(): void;
}
