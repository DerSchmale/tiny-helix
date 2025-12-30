/// <reference types="@webgpu/types" />
import { Texture } from "../Texture";
import { WebGPUContext } from "../WebGPUContext";
export declare class MipRenderer {
    private _pipeline;
    private _ctx;
    private _bindgroupLayout;
    private _bindgroups;
    private _views;
    private _passDescs;
    constructor(ctx: WebGPUContext, shader: GPUShaderModule, texture: Texture);
    render(): void;
}
