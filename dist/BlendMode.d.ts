/// <reference types="@webgpu/types" />
import { BlendFactor } from "./enums";
export declare class BlendMode {
    readonly _inner: GPUBlendState;
    static ALPHA: BlendMode;
    static ADDITIVE: BlendMode;
    static MULTIPLY: BlendMode;
    static SCREEN: BlendMode;
    static OVERLAY: BlendMode;
    static DARKEN: BlendMode;
    static LIGHTEN: BlendMode;
    get srcFactor(): BlendFactor;
    set srcFactor(value: BlendFactor);
    get dstFactor(): BlendFactor;
    set dstFactor(value: BlendFactor);
    get alphaSrcFactor(): BlendFactor;
    set alphaSrcFactor(value: BlendFactor);
    get alphaDstFactor(): BlendFactor;
    set alphaDstFactor(value: BlendFactor);
    constructor(srcFactor: BlendFactor, dstFactor: BlendFactor, alphaSrcFactor: BlendFactor, alphaDstFactor: BlendFactor);
}
