import {BlendFactor} from "./enums";

export class BlendMode {
    readonly _inner: GPUBlendState = {
        color: {srcFactor: BlendFactor.SrcAlpha, dstFactor: BlendFactor.OneMinusSrcAlpha},
        alpha: {srcFactor: BlendFactor.One, dstFactor: BlendFactor.OneMinusSrcAlpha}
    };

    static ALPHA: BlendMode = new BlendMode(BlendFactor.SrcAlpha, BlendFactor.OneMinusSrcAlpha, BlendFactor.One, BlendFactor.OneMinusSrcAlpha);
    static ADDITIVE: BlendMode = new BlendMode(BlendFactor.SrcAlpha, BlendFactor.One, BlendFactor.One, BlendFactor.One)
    static MULTIPLY: BlendMode = new BlendMode(BlendFactor.DstColor, BlendFactor.Zero, BlendFactor.Zero, BlendFactor.One)
    static SCREEN: BlendMode = new BlendMode(BlendFactor.One, BlendFactor.OneMinusSrcColor, BlendFactor.One, BlendFactor.OneMinusSrcAlpha)
    static OVERLAY: BlendMode = new BlendMode(BlendFactor.SrcAlpha, BlendFactor.OneMinusSrcAlpha, BlendFactor.One, BlendFactor.OneMinusSrcAlpha)
    static DARKEN: BlendMode = new BlendMode(BlendFactor.One, BlendFactor.OneMinusSrcColor, BlendFactor.One, BlendFactor.OneMinusSrcAlpha)
    static LIGHTEN: BlendMode = new BlendMode(BlendFactor.OneMinusSrcColor, BlendFactor.One, BlendFactor.One, BlendFactor.OneMinusSrcAlpha)

    get srcFactor(): BlendFactor { return this._inner.color.srcFactor as BlendFactor; }
    set srcFactor(value: BlendFactor) { this._inner.color.srcFactor = value; }
    get dstFactor(): BlendFactor { return this._inner.color.dstFactor as BlendFactor; }
    set dstFactor(value: BlendFactor) { this._inner.color.dstFactor = value; }
    get alphaSrcFactor(): BlendFactor { return this._inner.alpha.srcFactor as BlendFactor; }
    set alphaSrcFactor(value: BlendFactor) { this._inner.alpha.srcFactor = value; }
    get alphaDstFactor(): BlendFactor { return this._inner.alpha.dstFactor as BlendFactor; }
    set alphaDstFactor(value: BlendFactor) { this._inner.alpha.dstFactor = value; }

    constructor(srcFactor: BlendFactor, dstFactor: BlendFactor, alphaSrcFactor: BlendFactor, alphaDstFactor: BlendFactor) {
        this.srcFactor = srcFactor;
        this.dstFactor = dstFactor;
        this.alphaSrcFactor = alphaSrcFactor;
        this.alphaDstFactor = alphaDstFactor;
    }
}