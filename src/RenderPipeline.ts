import {Shader} from "./Shader";
import {mapUndefined} from "./utils/mapUndefined";
import {WebGPUContext} from "./WebGPUContext";

export class RenderPipelineBuilder {
    private _shader?: Shader;
    private _colorTargets: GPUColorTargetState[] = [];
    private _defaultColorState: GPUColorTargetState;
    private _ctx: WebGPUContext;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
        this._defaultColorState = {
            format: ctx.format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        }
    }

    withShader(shader: Shader): this {
        this._shader = shader;
        return this;
    }

    withColorTarget(format: GPUTextureFormat): this {
        this._colorTargets.push({
            format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        });
        return this;
    }

    withBlendMode(): this
    {
        const target = this._colorTargets.length ? this._colorTargets[this._colorTargets.length - 1] : this._defaultColorState;
        target.blend = undefined;
        return this;
    }

    // TODO: Add withBlendMode that applies to the last color target

    build(): RenderPipeline {
        if (!this._shader) {
            throw new Error("Shader not specified. Use withShader() to set the shader to use.");
        }

        const shader = this._shader!;

        if (shader.vertexEntry === undefined) {
            throw new Error("Shader does not contain a vertex entry point. Use ShaderBuilder.withVertexShader() to set one.");
        }

        const colorTargets = this._colorTargets.length ? this._colorTargets : [this._defaultColorState];

        const desc: GPURenderPipelineDescriptor = {
            // TODO: if shader contains layout, use it here
            layout: shader.layout ?? "auto",
            vertex: {
                module: shader.inner,
                buffers: undefined,
                entryPoint: shader.vertexEntry!,
            },
            fragment: mapUndefined(shader.fragmentEntry, entry => ({
                module: shader.inner,
                entryPoint: entry,
                targets: colorTargets
            }))
        }

        const inner = this._ctx.device.createRenderPipeline(desc);

        return new RenderPipeline(inner);
    }
}

/**
 * Lightweight wrapper around GPURenderPipeline. Provides an internal accessor for low-level interop.
 */
export class RenderPipeline {
    private _inner: GPURenderPipeline;

    constructor(inner: GPURenderPipeline) {
        this._inner = inner;
    }

    /**
     * Internal accessor for the underlying GPURenderPipeline. Not intended for public use.
     * @internal
     */
    get inner(): GPURenderPipeline { return this._inner; }
}