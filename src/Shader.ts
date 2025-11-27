import {WebGPUContext} from "./WebGPUContext";

interface Entries {
    vertex?: string;
    fragment?: string;
}

export class ShaderBuilder {
    private _code?: string;
    private _label?: string;
    private _ctx: WebGPUContext;
    private _entries: Entries = {};

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withLabel(label: string): ShaderBuilder {
        this._label = label;
        return this;
    }

    withCode(code: string): ShaderBuilder {
        this._code = code;
        return this;
    }

    withVertexShader(entry: string): ShaderBuilder {
        this._entries.vertex = entry;
        return this;
    }

    withFragmentShader(entry: string): ShaderBuilder {
        this._entries.fragment = entry;
        return this;
    }

    // TODO: Provide layout methods

    build(): Shader {
        if (!this._code) {
            throw new Error("Shader code not specified. Use withCode() to set the shader source.");
        }

        const inner = this._ctx.device.createShaderModule({
            label: this._label,
            code: this._code,
        });

        return new Shader(inner, this._entries);
    }
}

export class Shader {
    private _inner: GPUShaderModule;
    private _entries: Entries;
    private _layout?: GPUPipelineLayout;

    constructor(inner: GPUShaderModule, entries: Entries, layout?: GPUPipelineLayout) {
        this._inner = inner;
        this._entries = entries;
        this._layout = layout;
    }

    public get vertexEntry(): string | undefined { return this._entries.vertex; }
    public get fragmentEntry(): string | undefined { return this._entries.fragment; }
    public get layout(): GPUPipelineLayout | undefined { return this._layout; }

    /**
     * Internal accessor for the underlying GPUShaderModule. Not intended for public use.
     * @internal
     */
    public get inner(): GPUShaderModule { return this._inner; }

}