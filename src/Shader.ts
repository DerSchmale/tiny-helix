import {WebGPUContext} from "./WebGPUContext";
import {BindGroupBuilder, BindGroupLayout, BindGroupLayoutBuilder} from "./BindGroup";

type AttributeMap = Map<string, number>;

/**
 * Wrapper around GPUShaderModule. Keeps a map of vertex attribute names to
 * shader locations to aid pipeline construction.
 */
export class Shader {
    /** @internal */
    readonly _inner: GPUShaderModule;
    /** @internal */
    readonly _bindGroupLayouts: BindGroupLayout[] | undefined;

    private _vertexAttributes: AttributeMap;
    private _ctx: WebGPUContext;

    constructor(inner: GPUShaderModule, ctx: WebGPUContext, vertexAttributes: AttributeMap, bindGroupLayouts?: BindGroupLayout[]) {
        this._inner = inner;
        this._ctx = ctx;
        this._vertexAttributes = vertexAttributes;
        this._bindGroupLayouts = bindGroupLayouts;
    }

    getVertexAttributeLocation(name: string): number | undefined {
        return this._vertexAttributes.get(name) ?? undefined;
    }

    hasVertexAttribute(name: string): boolean {
        return this._vertexAttributes.has(name);
    }

    createBindGroup(group: number): BindGroupBuilder {
        return new BindGroupBuilder(this._ctx, this._bindGroupLayouts![group]);
    }
}

/**
 * Builder for creating shader modules and declaring attribute locations used by the helper
 * pipeline builder.
 */
export class ShaderBuilder {
    private _code?: string;
    private _label?: string;
    private _ctx: WebGPUContext;
    private _vertexAttributes: AttributeMap = new Map();    // name -> location
    private _bindGroupLayouts: BindGroupLayout[] | undefined;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    /** Optional label for the underlying GPUShaderModule. */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    /** Set WGSL or other shader code to compile into a GPUShaderModule. */
    withCode(code: string): this {
        this._code = code;
        return this;
    }

    /** Declare a named vertex attribute and the location it maps to in the shader. */
    withVertexAttribute(name: string, location: number): this {
        this._vertexAttributes.set(name, location);
        return this;
    }

    withBindGroup(index: number, buildFunc?: (builder: BindGroupLayoutBuilder) => void): this {
        const builder = new BindGroupLayoutBuilder(this._ctx);
        buildFunc?.(builder);
        this._bindGroupLayouts = this._bindGroupLayouts ?? [];
        this._bindGroupLayouts[index] = builder.build();
        return this;
    }

    // TODO: Provide layout methods

    /** Compile the shader module and return a `Shader` instance. */
    build(): Shader {
        if (!this._code) {
            throw new Error("Shader code not specified. Use withCode() to set the shader source.");
        }

        const inner = this._ctx.device.createShaderModule({
            label: this._label,
            code: this._code,
        });

        return new Shader(inner, this._ctx, this._vertexAttributes, this._bindGroupLayouts);
    }
}
