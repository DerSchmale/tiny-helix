/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { Shader } from "./Shader";
export declare class ComputePipeline {
    readonly _inner: GPUComputePipeline;
    constructor(inner: GPUComputePipeline);
}
export declare class ComputePipelineBuilder {
    private _ctx;
    private _label?;
    private _shader;
    private _entry;
    private _overrideConstants;
    constructor(ctx: WebGPUContext);
    withLabel(label: string): this;
    withOverrideConstant(id: string, value: number): this;
    /** Select the shader entry point for the fragment stage. */
    withShader(shader: Shader, entry: string): this;
    build(): ComputePipeline;
}
