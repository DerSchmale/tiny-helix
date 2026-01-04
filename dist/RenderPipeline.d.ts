/// <reference types="@webgpu/types" />
import { Shader } from "./Shader";
import { WebGPUContext } from "./WebGPUContext";
import { Mesh } from "./Mesh";
import { CompareFunction, CullMode, TextureFormat } from "./enums";
import { BlendMode } from "./BlendMode";
/**
 * Thin wrapper around GPURenderPipeline exposing a small helper for attribute
 * location lookup. The underlying pipeline and shader are available for advanced use.
 */
export declare class RenderPipeline {
    /** @internal */
    readonly _inner: GPURenderPipeline;
    private _shader;
    constructor(inner: GPURenderPipeline, shader: Shader);
    /**
     * Helper to get the shader-declared attribute location for a named attribute.
     */
    getVertexAttributeLocation(name: string): number | undefined;
}
/**
 * Fluent builder for creating a GPURenderPipeline. Attach a `Shader` and
 * optionally a `Mesh` (to derive vertex buffer layouts) before calling `build()`.
 */
export declare class RenderPipelineBuilder {
    private _ctx;
    private _shader?;
    private _colorTargets;
    private _defaultColorState;
    private _depthState?;
    private _defaultDepthState?;
    private _vertexEntry;
    private _fragmentEntry;
    private _label;
    private _overrideConstants;
    private _cullMode;
    private _mesh;
    constructor(ctx: WebGPUContext, defaultDepthFormat?: TextureFormat);
    /** Assign a human-readable label for the pipeline (useful in graphics debuggers). */
    withLabel(label: string): this;
    /** Set face-culling mode. Default is `Back`. */
    withCullMode(value: CullMode): this;
    /** Provide a Mesh to automatically derive vertex buffer layouts. */
    withMesh(mesh: Mesh): this;
    /** Attach a compiled Shader to the pipeline. */
    withShader(shader: Shader): this;
    /** Select the shader entry point for the vertex stage. */
    withVertexShader(entry: string): this;
    /** Select the shader entry point for the fragment stage. */
    withFragmentShader(entry: string): this;
    /** Add a color target with the given texture format. */
    withColorTarget(format: TextureFormat): this;
    /**
     * Add a depth target with the given texture format.
     */
    withDepthTarget(format: TextureFormat): this;
    /**
     * Set the depth compare function. Default is `less`.
     * @param compare
     */
    withDepthCompare(compare: CompareFunction): this;
    /**
     * Enable or disable depth writes. Default is `true`.
     * @param enabled
     */
    withDepthWrite(enabled: boolean): this;
    /**
     * Override a shader constant for specialization. We do NOT use `ShaderStage.Vertex | ShaderStage.Fragment` as
     * default because some browser implementations (as of early 2026) have bugs when a non-existent constant is defined
     */
    withOverrideConstant(id: string, value: number, pipeline: GPUShaderStageFlags): this;
    /** Set the blend mode for the last assigned (or default) color target. */
    withBlendMode(blendMode: BlendMode): this;
    /** Set the color write mask for the last assigned (or default) color target. */
    withColorWrite(r: boolean, g?: boolean, b?: boolean, a?: boolean): this;
    /**
     * Build and create the `RenderPipeline`. Throws if required pieces (shader/vertices)
     * are missing.
     */
    build(): RenderPipeline;
    private get lastColorTarget();
}
