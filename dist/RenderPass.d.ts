/// <reference types="@webgpu/types" />
import { RenderTarget } from "./RenderTarget";
import { RenderPipeline } from "./RenderPipeline";
import { Mesh } from "./Mesh";
import { BindGroup } from "./BindGroup";
import { IndexedCollection } from "./utils/IndexedCollection";
/**
 * Lightweight wrapper around GPURenderPassEncoder. Provides a minimal API
 * for ending the pass; higher-level helpers may be added later.
 */
export declare class RenderPass {
    private readonly _inner;
    private _renderPipeline?;
    private _numVertices;
    private _numIndices;
    /**
     * Internal accessor for the underlying GPURenderPassEncoder. Not intended for public use.
     * @internal
     */
    constructor(inner: GPURenderPassEncoder);
    /**
     * Set the render pipeline to use for the next draw calls.
     * @param pipeline
     */
    setPipeline(pipeline: RenderPipeline): this;
    /**
     * Sets the mesh to use for the next draw calls.
     * @param mesh
     */
    setMesh(mesh: Mesh): this;
    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index: number, bindGroup: BindGroup): this;
    /**
     * Issue a draw call using the currently set pipeline and mesh.
     */
    draw(): this;
    /**
     * End the render pass. After calling end(), the underlying encoder may
     * continue recording other passes or be finished/submitted.
     */
    end(): void;
}
/**
 * Fluent builder for configuring and creating a render pass.
 *
 * Use the builder to specify color targets, clear values and labels before
 * calling `build()` to obtain a `RenderPass` instance.
 */
export declare class RenderPassBuilder {
    private _encoder;
    private _label?;
    private _colorTargets;
    private _clearColors;
    private _defaultTarget;
    private _defaultDepthTarget?;
    private _depthTarget?;
    private _clearDepth?;
    private _clearStencil?;
    private _globalBindGroups;
    /**
     * Create a new builder instance. This should only be called from the CommandEncoder
     * instance (see {@link CommandEncoder.createRenderPass}).
     * @internal
     */
    constructor(commandEncoder: GPUCommandEncoder, globalBindGroups: BindGroup[], defaultTarget: RenderTarget, defaultDepthTarget?: RenderTarget);
    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label: string): this;
    /**
     * Add a color target to render into. If no targets are added the default
     * backbuffer target will be used.
     */
    withColorTarget(target: RenderTarget): this;
    withDepthStencilTarget(target: RenderTarget): this;
    /**
     * Set the clear color for the most recently added color target.
     * Overloads allow passing an array or individual color components.
     */
    withClearColor(): this;
    withClearColor(r: number[] | IndexedCollection): this;
    withClearColor(r: number, g: number, b: number): this;
    withClearColor(r: number, g: number, b: number, a: number): this;
    /**
     * Set the clear stencil value
     */
    withClearStencil(stencil: number): this;
    /**
     * Set the clear depth value
     */
    withClearDepth(depth: number): this;
    /**
     * Build and begin the render pass. Returns a `RenderPass` wrapper around
     * the low-level GPURenderPassEncoder.
     */
    build(): RenderPass;
}
