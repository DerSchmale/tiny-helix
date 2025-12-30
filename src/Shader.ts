import {WebGPUContext} from "./WebGPUContext";
import BindGroupLayoutBuilder, {BindGroupBuilder, BindGroupLayout} from "./BindGroup";

type AttributeMap = Map<string, number>;
type BindGroupLayoutFunc = (builder: BindGroupLayoutBuilder) => void;

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

    /**
     * @internal
     */
    constructor(inner: GPUShaderModule, ctx: WebGPUContext, vertexAttributes: AttributeMap, bindGroupLayouts?: BindGroupLayout[]) {
        this._inner = inner;
        this._ctx = ctx;
        this._vertexAttributes = vertexAttributes;
        this._bindGroupLayouts = bindGroupLayouts;
    }

    /**
     * Get the shader location for a named vertex attribute. Returns undefined if the attribute
     * is not declared by the shader.
     */
    getVertexAttributeLocation(name: string): number | undefined {
        return this._vertexAttributes.get(name) ?? undefined;
    }

    /**
     * Returns true if the shader declares a vertex attribute with the given name.
     * @param name
     */
    hasVertexAttribute(name: string): boolean {
        return this._vertexAttributes.has(name);
    }

    /**
     * Create a BindGroupBuilder for the shader's bind group at the given index.
     * @param group - index of the bind group declared by the shader
     */
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
    private _includes: Map<string, string> = new Map();

    /**
     * @internal
     */
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

    /**
     * Add a named include to the shader code. The include will be expanded
     * in the shader code before compilation. The include name must be unique
     * within the shader code. This allows using `#include<name>` in the shader
     * code to include other files. While this is not standard WGSL, it's too
     * useful not to support.
     *
     * @param name - The name as used in the `#include<name>` directive.
     * @param code - The code the include should expand to.
     */
    withInclude(name: string, code: string): this {
        this._includes.set(name, code);
        return this;
    }

    /** Declare a named vertex attribute and the location it maps to in the shader. */
    withVertexAttribute(location: number, name: string): this {
        this._vertexAttributes.set(name, location);
        return this;
    }

    /**
     * Declare a bind group layout used by this shader. The provided builder
     * callback is used to construct the layout description.
     */
    withBindGroup(index: number, layout: BindGroupLayout): this;
    withBindGroup(index: number, buildFunc: (builder: BindGroupLayoutBuilder) => void): this;
    withBindGroup(index: number, layout: BindGroupLayout | BindGroupLayoutFunc): this {
        this._bindGroupLayouts = this._bindGroupLayouts ?? [];
        if (layout instanceof BindGroupLayout) {
            this._bindGroupLayouts[index] = layout;
        }
        else {
            const builder = new BindGroupLayoutBuilder(this._ctx);
            layout(builder);
            this._bindGroupLayouts[index] = builder.build();
        }
        return this;
    }

    // TODO: Provide layout methods

    /** Compile the shader module and return a `Shader` instance. */
    build(): Shader {
        if (!this._code) {
            throw new Error("Shader code not specified. Use withCode() to set the shader source.");
        }

        let code = this._code;
        for (const [name, inc] of this._includes) {
            // Create a regex to match the include directive while allowing
            // optional whitespace between tokens, e.g.:
            //   #include<name>
            //   # include < name >
            // and so on. Escape the include name so it is safe in a RegExp.
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const includeRegex = new RegExp(`#\\s*include\\s*<\\s*${escapedName}\\s*>`, 'g');
            code = code.replace(includeRegex, inc);
        }

        const inner = this._ctx.device.createShaderModule({
            label: this._label,
            code,
        });

        return new Shader(inner, this._ctx, this._vertexAttributes, this._bindGroupLayouts);
    }
}
