import {Shader} from "./Shader";
import {mapUndefined} from "./utils/mapUndefined";
import {WebGPUContext} from "./WebGPUContext";
import {Mesh} from "./Mesh";

export enum CullMode {
    None = 'none',
    Front = 'front',
    Back = 'back'
}

/**
 * Thin wrapper around GPURenderPipeline exposing a small helper for attribute
 * location lookup. The underlying pipeline and shader are available for advanced use.
 */
export class RenderPipeline {
    /** @internal */
    readonly _inner: GPURenderPipeline;
    private _shader: Shader;

    constructor(inner: GPURenderPipeline, shader: Shader) {
        this._inner = inner;
        this._shader = shader;
    }

    /**
     * Helper to get the shader-declared attribute location for a named attribute.
     */
    public getVertexAttributeLocation(name: string): number | undefined {
        return this._shader.getVertexAttributeLocation(name);
    }
}

/**
 * Fluent builder for creating a GPURenderPipeline. Attach a `Shader` and
 * optionally a `Mesh` (to derive vertex buffer layouts) before calling `build()`.
 */
export class RenderPipelineBuilder {
    private _shader?: Shader;
    private _colorTargets: GPUColorTargetState[] = [];
    private _defaultColorState: GPUColorTargetState;
    private _ctx: WebGPUContext;
    private _vertexEntry: string | undefined = undefined;
    private _fragmentEntry: string | undefined = undefined;
    private _label: string | undefined = undefined;
    private _overrideConstants: Record<string, number> = {};
    private _cullMode: CullMode = CullMode.Back;
    private _mesh: Mesh | undefined = undefined;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
        this._defaultColorState = {
            format: ctx.format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        }
    }

    /** Assign a human-readable label for the pipeline (useful in graphics debuggers). */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    /** Set face-culling mode. Default is `Back`. */
    withCullMode(value: CullMode): this {
        this._cullMode = value;
        return this;
    }

    /** Provide a Mesh to automatically derive vertex buffer layouts. */
    withMesh(mesh: Mesh): this {
        this._mesh = mesh;
        return this;
    }

    /** Attach a compiled Shader to the pipeline. */
    withShader(shader: Shader): this {
        this._shader = shader;
        return this;
    }

    /** Select the shader entry point for the vertex stage. */
    withVertexShader(entry: string): this {
        this._vertexEntry = entry;
        return this;
    }

    /** Select the shader entry point for the fragment stage. */
    withFragmentShader(entry: string): this {
        this._fragmentEntry = entry;
        return this;
    }

    /** Add a color target with the given texture format. */
    withColorTarget(format: GPUTextureFormat): this {
        this._colorTargets.push({
            format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        });
        return this;
    }

    /** Override a shader constant for specialization. */
    withOverrideConstant(id: string, value: number): this {
        this._overrideConstants[id] = value;
        return this;
    }

    withBlendMode(): this {
        this.lastColorTarget.blend = undefined;
        return this;
    }

    /**
     * Build and create the `RenderPipeline`. Throws if required pieces (shader/vertices)
     * are missing.
     */
    build(): RenderPipeline {
        if (!this._shader) {
            throw new Error("Shader not specified. Use withShader() to set the shader to use.");
        }

        const shader = this._shader!;

        if (this._vertexEntry === undefined) {
            throw new Error("Shader does not contain a vertex entry point. Use ShaderBuilder.withVertexShader() to set one.");
        }

        const colorTargets = this._colorTargets.length ? this._colorTargets : [this._defaultColorState];
        const primitive: GPUPrimitiveState | undefined = mapUndefined(this._mesh, mesh => ({
            topology: mesh.topology,
            frontFace: mesh.frontFace,
            cullMode: this._cullMode,
        }));

        const buffers = mapUndefined(this._mesh, mesh => {
            const buffers: GPUVertexBufferLayout[] = [];
            for (let i = 0; i < mesh.numStreams; ++i) {
                const attributes = mesh.getStreamAttributes(i)
                    .filter(attr => shader.hasVertexAttribute(attr.name))
                    .map(attr => ({
                        shaderLocation: shader.getVertexAttributeLocation(attr.name)!,
                        offset: attr.offset,
                        format: attr.format,
                    }));

                buffers.push({
                    arrayStride: mesh.getStreamStride(i),
                    stepMode: 'vertex',
                    attributes
                });
            }
            return buffers;
        });

        const layout = mapUndefined(
            shader._bindGroupLayouts,
            bindGroupLayouts => this._ctx.device.createPipelineLayout({
                bindGroupLayouts: bindGroupLayouts.map(value => value._inner),
                label: this._label
            })
        ) ?? "auto";

        const desc: GPURenderPipelineDescriptor = {
            label: this._label,
            layout,
            primitive,
            vertex: {
                buffers,
                module: shader._inner,
                entryPoint: this._vertexEntry!,
                constants: this._overrideConstants
            },
            fragment: mapUndefined(this._fragmentEntry, entry => ({
                module: shader._inner,
                entryPoint: entry,
                targets: colorTargets,
                constants: this._overrideConstants
            }))
        }

        const inner = this._ctx.device.createRenderPipeline(desc);

        return new RenderPipeline(inner, shader);
    }

    private get lastColorTarget(): GPUColorTargetState {
        return this._colorTargets.length ? this._colorTargets[this._colorTargets.length - 1] : this._defaultColorState;
    }
}
