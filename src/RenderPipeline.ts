import {Shader} from "./Shader";
import {mapUndefined} from "./utils/mapUndefined";
import {WebGPUContext} from "./WebGPUContext";
import {Mesh} from "./Mesh";
import {CompareFunction, CullMode, ShaderStage, TextureFormat} from "./enums";
import {BlendMode} from "./BlendMode";

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
    private _ctx: WebGPUContext;
    private _shader?: Shader;
    private _colorTargets: GPUColorTargetState[] = [];
    private _defaultColorState: GPUColorTargetState[];
    private _depthState?: GPUDepthStencilState;
    private _defaultDepthState?: GPUDepthStencilState;
    private _vertexEntry: string | undefined = undefined;
    private _fragmentEntry: string | undefined = undefined;
    private _label: string | undefined = undefined;
    private _overrideConstants: Record<ShaderStage, Record<string, number>> = {};
    private _cullMode: CullMode = CullMode.Back;
    private _mesh: Mesh | undefined = undefined;

    constructor(ctx: WebGPUContext, defaultDepthFormat?: TextureFormat) {
        this._ctx = ctx;
        this._defaultColorState = [{
            format: ctx.format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        }];
        this._defaultDepthState = mapUndefined(defaultDepthFormat, format => ({
            format,
            depthWriteEnabled: true,
            depthCompare: 'less',
        }))
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
    withColorTarget(format: TextureFormat): this {
        this._colorTargets.push({
            format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        });
        return this;
    }

    /**
     * Add a depth target with the given texture format.
     */
    withDepthTarget(format: TextureFormat): this {
        this._depthState = {
            format,
            ...this._defaultDepthState
        };
        return this;
    }

    /**
     * Set the depth compare function. Default is `less`.
     * @param compare
     */
    withDepthCompare(compare: CompareFunction): this {
        const target = this._depthState ?? this._defaultDepthState;
        if (!target) {
            console.warn("No depth target set. Setting depth compare function has no effect.");
        }
        else {
            target.depthCompare = compare;
        }
        return this;
    }

    /**
     * Enable or disable depth writes. Default is `true`.
     * @param enabled
     */
    withDepthWrite(enabled: boolean): this {
        const target = this._depthState ?? this._defaultDepthState;
        if (!target) {
            console.warn("No depth target set. Setting depth write enabled has no effect.");
        }
        else {
            target.depthWriteEnabled = enabled;
        }
        return this;
    }

    /**
     * Override a shader constant for specialization. We do NOT use `ShaderStage.Vertex | ShaderStage.Fragment` as
     * default because some browser implementations (as of early 2026) have bugs when a non-existent constant is defined
     */
    withOverrideConstant(id: string, value: number, pipeline: GPUShaderStageFlags): this {
        if (pipeline & GPUShaderStage.VERTEX) {
            this._overrideConstants[ShaderStage.Vertex] = this._overrideConstants[ShaderStage.Vertex] || {};
            this._overrideConstants[ShaderStage.Vertex][id] = value;
        }
        if (pipeline & GPUShaderStage.FRAGMENT) {
            this._overrideConstants[ShaderStage.Fragment] = this._overrideConstants[ShaderStage.Fragment] || {};
            this._overrideConstants[ShaderStage.Fragment][id] = value;
        }
        return this;
    }

    /** Set the blend mode for the last assigned (or default) color target. */
    withBlendMode(blendMode: BlendMode): this {
        this.lastColorTarget.blend = blendMode._inner;
        return this;
    }

    /** Set the color write mask for the last assigned (or default) color target. */
    withColorWrite(r: boolean, g?: boolean, b?: boolean, a?: boolean): this {
        g ??= r;
        b ??= g;
        a ??= b;

        this.lastColorTarget.writeMask =
            (r ? GPUColorWrite.RED : 0) |
            (g ? GPUColorWrite.GREEN : 0) |
            (b ? GPUColorWrite.BLUE : 0) |
            (a ? GPUColorWrite.ALPHA : 0);
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

        let colorTargets: GPUColorTargetState[];
        let depthState: GPUDepthStencilState | undefined;

        if (this._colorTargets.length || !!this._depthState) {
            colorTargets = this._colorTargets;
            depthState = this._depthState;
        }
        else {
            // only use defaults if no targets were set explicitly
            colorTargets = this._defaultColorState;
            depthState = this._defaultDepthState;
        }

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
            depthStencil: depthState,
            vertex: {
                buffers,
                module: shader._inner,
                entryPoint: this._vertexEntry!,
                constants: this._overrideConstants[ShaderStage.Vertex]
            },
            fragment: mapUndefined(this._fragmentEntry, entry => ({
                module: shader._inner,
                entryPoint: entry,
                targets: colorTargets,
                constants: this._overrideConstants[ShaderStage.Fragment]
            }))
        }

        const inner = this._ctx.device.createRenderPipeline(desc);
        return new RenderPipeline(inner, shader);
    }

    private get lastColorTarget(): GPUColorTargetState {
        return this._colorTargets.length ? this._colorTargets[this._colorTargets.length - 1] : this._defaultColorState[0];
    }
}
