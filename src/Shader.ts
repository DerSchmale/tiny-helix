import {WebGPUContext} from "./WebGPUContext";
import {mapUndefined} from "./utils/mapUndefined";

type AttributeMap = Map<string, number>;

/**
 * Builder for creating shader modules and declaring attribute locations used by the helper
 * pipeline builder.
 */
export class ShaderBuilder {
    private _code?: string;
    private _label?: string;
    private _ctx: WebGPUContext;
    private _vertexAttributes: AttributeMap = new Map();    // name -> location
    private _bindGroupLayouts: GPUBindGroupLayout[] | undefined;

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

        // TODO: Provide these in the builder
        const layout = mapUndefined(
            this._bindGroupLayouts,
            bindGroupLayouts => this._ctx.device.createPipelineLayout({bindGroupLayouts})
        );

        return new Shader(inner, this._vertexAttributes, layout);
    }
}

/**
 * Wrapper around GPUShaderModule. Keeps a map of vertex attribute names to
 * shader locations to aid pipeline construction.
 */
export class Shader {
    private _inner: GPUShaderModule;
    private _layout?: GPUPipelineLayout;
    private _vertexAttributes: AttributeMap;

    constructor(inner: GPUShaderModule, vertexAttributes: AttributeMap, layout?: GPUPipelineLayout) {
        this._inner = inner;
        this._layout = layout;
        this._vertexAttributes = vertexAttributes;
    }

    get layout(): GPUPipelineLayout | undefined {
        return this._layout;
    }

    getVertexAttributeLocation(name: string): number | undefined {
        return this._vertexAttributes.get(name) ?? undefined;
    }

    hasVertexAttribute(name: string): boolean {
        return this._vertexAttributes.has(name);
    }

    /**
     * Internal accessor for the underlying GPUShaderModule. Not intended for public use.
     * @internal
     */
    public get inner(): GPUShaderModule {
        return this._inner;
    }
}