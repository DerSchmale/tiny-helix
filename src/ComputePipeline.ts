import {TinyHelix} from "./TinyHelix";
import {WebGPUContext} from "./WebGPUContext";
import {Shader} from "./Shader";
import {mapUndefined} from "./utils/mapUndefined";

export class ComputePipeline {
    readonly _inner: GPUComputePipeline;

    constructor(inner: GPUComputePipeline) {
        this._inner = inner;
    }
}

export class ComputePipelineBuilder {
    private _ctx: WebGPUContext;
    private _label?: string;
    private _shader!: Shader;
    private _entry!: string;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withLabel(label: string): this
    {
        this._label = label;
        return this;
    }

    /** Select the shader entry point for the fragment stage. */
    withShader(shader: Shader, entry: string): this {
        this._shader = shader;
        this._entry = entry;
        return this;
    }

    build(): ComputePipeline {
        const shader = this._shader;
        const layout = mapUndefined(
            shader._bindGroupLayouts,
            bindGroupLayouts => this._ctx.device.createPipelineLayout({
                bindGroupLayouts: bindGroupLayouts.map(value => value._inner),
                label: this._label
            })
        ) ?? "auto";

        const desc: GPUComputePipelineDescriptor = {
            label: this._label,
            compute: {
                module: shader._inner,
                entryPoint: this._entry
            },
            layout
        };
        return new ComputePipeline(this._ctx.device.createComputePipeline(desc));
    }
}