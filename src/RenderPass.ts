import {RenderTarget} from "./RenderTarget";
import {RenderPipeline} from "./RenderPipeline";
import {Mesh} from "./Mesh";
import {BindGroup} from "./BindGroup";
import {IndexedCollection} from "./utils/IndexedCollection";
import {mapUndefined} from "./utils/mapUndefined";
import {TextureFormat} from "./enums";

/**
 * Lightweight wrapper around GPURenderPassEncoder. Provides a minimal API
 * for ending the pass; higher-level helpers may be added later.
 */
export class RenderPass {
    private readonly _inner: GPURenderPassEncoder;
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
    setPipeline(pipeline: RenderPipeline): this {
        if (this._renderPipeline != pipeline) {
            this._inner.setPipeline(pipeline._inner);
            this._renderPipeline = pipeline;
        }

        return this;
    }

    /**
     * Sets the mesh to use for the next draw calls.
     * @param mesh
     */
    setMesh(mesh: Mesh): this {
        for (let i = 0; i < mesh.numStreams; ++i) {
            const vertex_buffer = mesh.getVertexBuffer(i);
            this._inner.setVertexBuffer(i, vertex_buffer._inner);
        }

        this._numVertices = mesh.numVertices;

        const indexBuffer = mesh.indexBuffer;
        if (indexBuffer) {
            this._inner.setIndexBuffer(indexBuffer._inner, mesh.indexFormat);
            this._numIndices = mesh.numIndices;
        } else {
            this._numIndices = 0;
        }

        return this;
    }

    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index: number, bindGroup: BindGroup): this {
        this._inner.setBindGroup(index, bindGroup._inner);
        return this;
    }

    /**
     * Issue a draw call using the currently set pipeline and mesh.
     */
    draw(numInstances = 1): this {
        if (this._numIndices) {
            this._inner.drawIndexed(this._numIndices, numInstances, 0, 0, 0);
        } else {
            this._inner.draw(this._numVertices, numInstances, 0, 0);
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

/**
 * Fluent builder for configuring and creating a render pass.
 *
 * Use the builder to specify color targets, clear values and labels before
 * calling `build()` to obtain a `RenderPass` instance.
 */
export class RenderPassBuilder {
    private _encoder: GPUCommandEncoder;
    private _label?: string;
    private _colorTargets: RenderTarget[] = [];
    private _clearColors: number[][] = [];
    private _defaultTarget: RenderTarget;
    private _defaultDepthTarget?: RenderTarget;
    private _depthTarget?: RenderTarget;
    private _clearDepth?: number;
    private _clearStencil?: number;
    private _globalBindGroups: BindGroup[];

    /**
     * Create a new builder instance. This should only be called from the CommandEncoder
     * instance (see {@link CommandEncoder.createRenderPass}).
     * @internal
     */
    constructor(commandEncoder: GPUCommandEncoder, globalBindGroups: BindGroup[], defaultTarget: RenderTarget, defaultDepthTarget?: RenderTarget) {
        this._encoder = commandEncoder;
        this._defaultTarget = defaultTarget;
        this._defaultDepthTarget = defaultDepthTarget;
        this._globalBindGroups = globalBindGroups;
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

    withDepthStencilTarget(target: RenderTarget): this {
        this._depthTarget = target;
        return this;
    }

    /**
     * Set the clear color for the most recently added color target.
     * Overloads allow passing an array or individual color components.
     */
    withClearColor(): this;
    withClearColor(r: number[] | IndexedCollection): this;
    withClearColor(r: number, g: number, b: number): this;
    withClearColor(r: number, g: number, b: number, a: number): this;
    withClearColor(r?: number | number[] | IndexedCollection, g?: number, b?: number, a?: number): this {
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
        } else {
            this._clearColors[this._colorTargets.length - 1] = color;
        }

        return this;
    }

    /**
     * Set the clear stencil value
     */
    withClearStencil(stencil: number): this {
        this._clearStencil = stencil;
        return this;
    }

    /**
     * Set the clear depth value
     */
    withClearDepth(depth: number): this {
        this._clearDepth = depth;
        return this;
    }

    /**
     * Build and begin the render pass. Returns a `RenderPass` wrapper around
     * the low-level GPURenderPassEncoder.
     */
    build(): RenderPass {
        let targets: RenderTarget[];
        let depthTarget: RenderTarget | undefined;

        // if anything was specified specifically, use those, otherwise use the defaults
        if (this._colorTargets.length || !!this._depthTarget) {
            targets = this._colorTargets;
            depthTarget = this._depthTarget;
        } else {
            targets = [this._defaultTarget];
            depthTarget = this._defaultDepthTarget;
        }

        let stencilLoadOp: GPULoadOp | undefined;
        let stencilStoreOp: GPUStoreOp | undefined;
        let stencilClearValue: number | undefined;

        if (depthTarget?.format === TextureFormat.Depth32FloatStencil8 || depthTarget?.format === TextureFormat.Depth24PlusStencil8) {
            stencilLoadOp = this._clearStencil != undefined ? 'clear' : 'load';
            stencilStoreOp = mapUndefined(this._clearStencil, () => 'store');
            stencilClearValue = this._clearStencil;
        }

        const colorAttachments: GPURenderPassColorAttachment[] = targets.map((target, i) => ({
            view: target._inner,
            loadOp: this._clearColors[i] ? 'clear' : 'load',
            storeOp: 'store',
            clearValue: this._clearColors[i]
        }));

        const desc: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment: mapUndefined(depthTarget, target => ({
                view: target._inner,
                depthClearValue: this._clearDepth,
                depthLoadOp: this._clearDepth != undefined ? 'clear' : 'load',
                depthStoreOp: mapUndefined(this._clearDepth, () => 'store'),
                stencilClearValue,
                stencilLoadOp,
                stencilStoreOp

            })),
            label: this._label
        };

        const pass = new RenderPass(this._encoder.beginRenderPass(desc));
        this._globalBindGroups.forEach((group, i) => pass.setBindGroup(i, group));
        return pass;
    }
}
