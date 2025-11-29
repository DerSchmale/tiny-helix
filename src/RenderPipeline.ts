import {Shader} from "./Shader";
import {mapUndefined} from "./utils/mapUndefined";
import {WebGPUContext} from "./WebGPUContext";
import {Mesh} from "./Mesh";

export enum CullMode {
    None = 'none',
    Front = 'front',
    Back = 'back'
}

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

    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    withCullMode(value: CullMode): this {
        this._cullMode = value;
        return this;
    }

    withMesh(mesh: Mesh): this {
        this._mesh = mesh;
        return this;
    }

    withShader(shader: Shader): this {
        this._shader = shader;
        return this;
    }

    withVertexShader(entry: string): this {
        this._vertexEntry = entry;
        return this;
    }

    withFragmentShader(entry: string): this {
        this._fragmentEntry = entry;
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

    withOverrideConstant(id: string, value: number): this {
        this._overrideConstants[id] = value;
        return this;
    }

    withBlendMode(): this {
        this.lastColorTarget.blend = undefined;
        return this;
    }

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

        console.log(buffers);

        const desc: GPURenderPipelineDescriptor = {
            label: this._label,
            layout: shader.layout ?? "auto",
            primitive,
            vertex: {
                buffers,
                module: shader.inner,
                entryPoint: this._vertexEntry!,
                constants: this._overrideConstants
            },
            fragment: mapUndefined(this._fragmentEntry, entry => ({
                module: shader.inner,
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

/**
 * Lightweight wrapper around GPURenderPipeline. Provides an internal accessor for low-level interop.
 */
export class RenderPipeline {
    private _inner: GPURenderPipeline;
    private _shader: Shader;

    constructor(inner: GPURenderPipeline, shader: Shader) {
        this._inner = inner;
        this._shader = shader;
    }

    /**
     * Internal accessor for the underlying GPURenderPipeline. Not intended for public use.
     * @internal
     */
    get inner(): GPURenderPipeline {
        return this._inner;
    }

    public getVertexAttributeLocation(name: string): number | undefined {
        return this._shader.getVertexAttributeLocation(name);
    }
}