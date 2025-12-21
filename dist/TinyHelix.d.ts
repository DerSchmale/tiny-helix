import { WebGPUContextOptions } from './WebGPUContext';
import { CommandEncoder } from "./CommandEncoder";
import { Texture, TextureBuilder } from "./Texture";
import { RenderTarget, RenderTargetBuilder } from "./RenderTarget";
import { ShaderBuilder } from "./Shader";
import { RenderPipelineBuilder } from "./RenderPipeline";
import { MeshBuilder } from "./Mesh";
import { UniformBuffer, UniformBufferLayout, UniformBufferLayoutBuilder } from "./buffers/UniformBuffer";
import BindGroupLayoutBuilder, { BindGroup, BindGroupBuilder, BindGroupLayout } from "./BindGroup";
import { SamplerBuilder } from "./Sampler";
import { ComputePipelineBuilder } from "./ComputePipeline";
import { TextureFormat } from "./enums";
/**
 * Options for initializing TinyHelix
 */
export interface TinyHelixOptions extends WebGPUContextOptions {
    /** Optional format to use for the depth/stencil buffer */
    depthStencilFormat?: TextureFormat;
}
/**
 * Main entry point for the tiny-helix API. Manages the WebGPU context,
 * backbuffer and provides helpers to create render targets and command encoders.
 */
export declare class TinyHelix {
    private _context;
    private _options;
    private _backbuffer?;
    private _backbufferTarget?;
    private _depthStencil?;
    private _depthStencilTarget?;
    private _shaderIncludes;
    private _canvas;
    private _globalBindBufferLayouts;
    private _globalBindBuffers;
    /**
     * Create a new TinyHelix instance. Call `initialize()` before rendering.
     */
    constructor(canvas: HTMLCanvasElement);
    /**
     * Initializes the underlying WebGPU context and prepares resources.
     * @param options - Configuration options forwarded to the WebGPU context
     * @example await tiny.initialize({ canvas: myCanvas });
     */
    initialize(options?: TinyHelixOptions): Promise<void>;
    resize(width: number, height: number): void;
    /**
     * Add a named include for all shader code. The include will be expanded
     * in any shader code created through {@link TinyHelix.createShader}.
     * The include name must be unique within the shader code. This allows
     * using `#include<name>` in the shader code to include other files.
     * While this is not standard WGSL, it's too useful not to support.
     '
     * @param name - The name as used in the `#include<name>` directive.
     * @param source - The code the include should expand to.
     */
    addShaderInclude(name: string, source: string): this;
    /**
     * Return the chosen depth/stencil format if configured.
     */
    depthStencilFormat(): TextureFormat | undefined;
    /**
     * The current frame's backbuffer texture. Valid after `startFrame()` has been
     * called.
     * @throws Error if accessed before startFrame()
     */
    get backbuffer(): Texture;
    /**
     * The RenderTarget wrapper for the current backbuffer. Valid after `startFrame()`.
     * @throws Error if accessed before startFrame()
     */
    get backbufferTarget(): RenderTarget;
    /**
     * Needs to be called before rendering each frame. Updates internal backbuffer
     * references to the current swapchain texture.
     * @example tiny.startFrame();
     */
    startFrame(): void;
    /**
     * Create a RenderTargetBuilder for a given texture.
     */
    createRenderTarget(target: Texture): RenderTargetBuilder;
    /**
     * Create a ShaderBuilder for creating a Shader.
     */
    createShader(): ShaderBuilder;
    /**
     * Create a BindGroupLayoutBuilder for creating a BindGroupLayout.
     */
    createBindGroupLayout(): BindGroupLayoutBuilder;
    /**
     * Create a BindGroupBuilder for creating a BindGroup.
     */
    createBindGroup(layout: BindGroupLayout): BindGroupBuilder;
    /**
     * Create a MeshBuilder for creating a Mesh.
     */
    createMesh(): MeshBuilder;
    /**
     * Create a RenderPipelineBuilder for creating a RenderPipeline.
     */
    createRenderPipeline(): RenderPipelineBuilder;
    /**
     * Create a ComputePipelineBuilder for creating a ComputePipeline.
     */
    createComputePipeline(): ComputePipelineBuilder;
    /**
     * Create a SamplerBuilder for creating a Sampler.
     */
    createSampler(): SamplerBuilder;
    /**
     * Create a TextureBuilder for creating a Texture.
     */
    createTexture(): TextureBuilder;
    /**
     * Creates a command encoder for recording GPU commands for the current frame.
     * @param label - Optional debug label to assign to the encoder
     */
    createCommandEncoder(label?: string): CommandEncoder;
    /**
     * Create a UniformBufferLayoutBuilder for creating a UniformBufferLayout.
     */
    createUniformBufferLayout(): UniformBufferLayoutBuilder;
    /**
     * Create a UniformBuffer for the given layout.
     */
    createUniformBuffer(layout: UniformBufferLayout): UniformBuffer;
    /**
     * Allows setting a global bind group for all render passes. This is useful
     * for setting bind groups that are used by all passes. These buffers will
     * automatically be set for all render and compute passes.
     * @param index - The index of the bind group in the render pipeline layout.
     * @param buffer - The bind group to set.
     */
    setGlobalBindGroup(index: number, layout: BindGroupLayout, buffer: BindGroup): this;
    /**
     * Destroy the TinyHelix instance and release all GPU resources.
     */
    destroy(): void;
    /**
     * Returns the current depth/stencil texture if configured.
     */
    depthStencilTexture(): Texture | undefined;
    /**
     * Returns the current depth/stencil RenderTarget if configured.
     */
    depthStencilTarget(): RenderTarget | undefined;
    private _createDepthStencil;
}
