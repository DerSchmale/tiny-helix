import {RenderTarget} from "./RenderTarget";
import {RenderPipeline} from "./RenderPipeline";
import {Mesh} from "./Mesh";

/**
 * Fluent builder for configuring and creating a render pass.
 *
 * Use the builder to specify color targets, clear values and labels before
 * calling `build()` to obtain a `RenderPass` instance.
 */
export class RenderPassBuilder {
    _encoder: GPUCommandEncoder;
    _label?: string;
    _colorTargets: RenderTarget[] = [];
    _clearColors: number[][] = [];
    _defaultTarget: RenderTarget;
    _clearDepth?: number;
    _clearStencil?: number;

    /**
     * Create a new builder instance. This should only be called from the CommandEncoder
     * instance (see {@link CommandEncoder.createRenderPass}).
     * @param commandEncoder
     * @param defaultTarget
     *
     * @internal
     */
    constructor(commandEncoder: GPUCommandEncoder, defaultTarget: RenderTarget) {
        this._encoder = commandEncoder;
        this._defaultTarget = defaultTarget;
    }

    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    /**
     * Add a color target to render into. If no targets are added the default
     * backbuffer target will be used.
     */
    withColorTarget(target: RenderTarget): this {
        this._colorTargets.push(target);
        return this;
    }

    /**
     * Set the clear color for the most recently added color target.
     * Overloads allow passing an array or individual color components.
     */
    withClearColor(): this;
    withClearColor(r: number[]): this;
    withClearColor(r: number, g: number, b: number): this;
    withClearColor(r: number, g: number, b: number, a: number): this;
    withClearColor(r?: number | number[], g?: number, b?: number, a?: number): this {
        let color;
        if (r === undefined) {
            color = [0.0, 0.0, 0.0, 1.0];
        } else if (typeof r === 'number') {
            color = [r, g ?? 0.0, b ?? 0.0, a ?? 1.0];
        } else {
            color = [r[0], r[1], r[2], r[3] ?? 1.0];
        }

        // rendering to the default target is special cased, so we need to set the clear color for the last target
        if (this._colorTargets.length === 0) {
            this._clearColors[0] = color;
        }
        else {
            this._clearColors[this._colorTargets.length - 1] = color;
        }

        return this;
    }

    /**
     * Set clear values for depth and stencil attachments. If called without
     * arguments default values will be used (depth=1.0, stencil=0).
     */
    withClearDepthStencil(): this;
    withClearDepthStencil(depth: number): this;
    withClearDepthStencil(depth?: number, stencil?: number): this {
        this._clearDepth = depth ?? 1.0;
        this._clearStencil = stencil ?? 0;
        return this;
    }

    /**
     * Build and begin the render pass. Returns a `RenderPass` wrapper around
     * the low-level GPURenderPassEncoder.
     */
    build(): RenderPass {
        const targets = this._colorTargets.length ? this._colorTargets : [this._defaultTarget];
        const colorAttachments: GPURenderPassColorAttachment[] = [];

        for (let i = 0; i < targets.length; ++i) {
            colorAttachments.push({
                view: targets[i].inner,
                loadOp: this._clearColors[i] ? 'clear' : 'load',
                storeOp: 'store',
                clearValue: this._clearColors[i]
            })
        }

        const desc: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment: undefined,
            label: this._label
        };

        return new RenderPass(this._encoder.beginRenderPass(desc));
    }
}

/**
 * Lightweight wrapper around GPURenderPassEncoder. Provides a minimal API
 * for ending the pass; higher-level helpers may be added later.
 */
export class RenderPass {
    private _inner: GPURenderPassEncoder;
    private _renderPipeline?: RenderPipeline;
    private _numVertices: number = 0;
    private _numIndices: number = 0;

    /**
     * Internal accessor for the underlying GPURenderPassEncoder. Not intended for public use.
     * @internal
     */
    constructor(inner: GPURenderPassEncoder) {
        this._inner = inner;
    }


    /**
     * Set the render pipeline to use for the next draw calls.
     * @param pipeline
     */
    setRenderPipeline(pipeline: RenderPipeline): this
    {
        if (this._renderPipeline != pipeline) {
            this._inner.setPipeline(pipeline.inner);
            this._renderPipeline = pipeline;
        }

        return this;
    }

    /**
     * Sets the mesh to use for the next draw calls.
     * @param mesh
     */
    setMesh(mesh: Mesh): this
    {
        for (let i = 0; i < mesh.numStreams; ++i) {
            const vertex_buffer = mesh.getVertexBuffer(i);
            this._inner.setVertexBuffer(i, vertex_buffer.inner);
        }

        this._numVertices = mesh.numVertices;

        const indexBuffer = mesh.indexBuffer;
        if (indexBuffer) {
            this._inner.setIndexBuffer(indexBuffer.inner, mesh.indexFormat);
            this._numIndices = mesh.numIndices;
        }
        else {
            this._numIndices = 0;
        }

        return this;
    }

    /**
     * Issue a draw call using the currently set pipeline and mesh.
     */
    draw(): this
    {
        if (this._numIndices) {
            this._inner.drawIndexed(this._numIndices, 1, 0, 0, 0);
        }
        else {
            this._inner.draw(this._numVertices, 1, 0, 0);
        }
        return this;
    }

    /**
     * End the render pass. After calling end(), the underlying encoder may
     * continue recording other passes or be finished/submitted.
     */
    end() {
        this._inner.end();
    }
}