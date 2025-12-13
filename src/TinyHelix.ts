import {WebGPUContext, WebGPUContextOptions} from './WebGPUContext';
import {CommandEncoder} from "./CommandEncoder";
import {Texture, TextureBuilder} from "./Texture";
import {RenderTarget, RenderTargetBuilder} from "./RenderTarget";
import {ShaderBuilder} from "./Shader";
import {RenderPipelineBuilder} from "./RenderPipeline";
import {MeshBuilder} from "./Mesh";
import {UniformBuffer, UniformBufferLayout, UniformBufferLayoutBuilder} from "./buffers/UniformBuffer";
import BindGroupLayoutBuilder, {BindGroupBuilder, BindGroupLayout} from "./BindGroup";
import {SamplerBuilder} from "./Sampler";
import {ComputePipelineBuilder} from "./ComputePipeline";
import {TextureFormat} from "./enums";
import {mapUndefined} from "./utils/mapUndefined";

/**
 * Options for initializing TinyHelix
 */
export interface TinyHelixOptions extends WebGPUContextOptions {
    // Possible to add more options later
    /** Optional format to use for the depth/stencil buffer */
    depthStencilFormat?: TextureFormat;
}

/**
 * Main entry point for the tiny-helix API. Manages the WebGPU context,
 * backbuffer and provides helpers to create render targets and command encoders.
 */
export class TinyHelix {
    private _context: WebGPUContext;
    private _options: TinyHelixOptions = {};
    private _backbuffer?: Texture;
    private _backbufferTarget?: RenderTarget;
    private _depthStencil?: Texture;
    private _depthStencilTarget?: RenderTarget;
    private _shaderIncludes: Map<string, string> = new Map();
    private _canvas: HTMLCanvasElement;

    /**
     * Create a new TinyHelix instance. Call `initialize()` before rendering.
     */
    constructor(canvas: HTMLCanvasElement) {
        this._context = new WebGPUContext();
        this._canvas = canvas;
    }

    /**
     * Initializes the underlying WebGPU context and prepares resources.
     * @param options - Configuration options forwarded to the WebGPU context
     * @example await tiny.initialize({ canvas: myCanvas });
     */
    async initialize(options: TinyHelixOptions = {}) {
        options.canvas = this._canvas;
        this._options = options;

        await this._context.initialize(options);

        this._createDepthStencil();
    }

    resize(width: number, height: number) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._createDepthStencil();
    }

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
    addShaderInclude(name: string, source: string): this {
        this._shaderIncludes.set(name, source);
        return this;
    }

    /**
     * Return the chosen depth/stencil format if configured.
     */
    depthStencilFormat(): TextureFormat | undefined {
        return this._options.depthStencilFormat;
    }

    /**
     * The current frame's backbuffer texture. Valid after `startFrame()` has been
     * called.
     * @throws Error if accessed before startFrame()
     */
    get backbuffer(): Texture {
        if (!this._backbuffer) {
            throw new Error('Backbuffer not initialized. Did you forget to call startFrame()?');
        }
        return this._backbuffer!;
    }

    /**
     * The RenderTarget wrapper for the current backbuffer. Valid after `startFrame()`.
     * @throws Error if accessed before startFrame()
     */
    get backbufferTarget(): RenderTarget {
        if (!this._backbufferTarget) {
            throw new Error('Backbuffer not initialized. Did you forget to call startFrame()?');
        }
        return this._backbufferTarget!;
    }

    /**
     * Needs to be called before rendering each frame. Updates internal backbuffer
     * references to the current swapchain texture.
     * @example tiny.startFrame();
     */
    startFrame() {
        this._backbuffer = Texture.from_webgpu(this._context.getCurrentTexture());
        this._backbufferTarget = this.createRenderTarget(this._backbuffer)
            .build();
    }

    /**
     * Create a RenderTargetBuilder for a given texture.
     */
    createRenderTarget(target: Texture): RenderTargetBuilder
    {
        return new RenderTargetBuilder(target);
    }

    /**
     * Create a ShaderBuilder for creating a Shader.
     */
    createShader(): ShaderBuilder
    {
        let builder = new ShaderBuilder(this._context);

        for (const [name, source] of this._shaderIncludes) {
            builder = builder.withInclude(name, source);
        }

        return builder;
    }

    /**
     * Create a BindGroupLayoutBuilder for creating a BindGroupLayout.
     */
    createBindGroupLayout(): BindGroupLayoutBuilder
    {
        return new BindGroupLayoutBuilder(this._context);
    }

    /**
     * Create a BindGroupBuilder for creating a BindGroup.
     */
    createBindGroup(layout: BindGroupLayout): BindGroupBuilder
    {
        return new BindGroupBuilder(this._context, layout);
    }

    /**
     * Create a MeshBuilder for creating a Mesh.
     */
    createMesh(): MeshBuilder
    {
        return new MeshBuilder(this._context);
    }

    /**
     * Create a RenderPipelineBuilder for creating a RenderPipeline.
     */
    createRenderPipeline(): RenderPipelineBuilder
    {
        return new RenderPipelineBuilder(this._context, this.depthStencilFormat());
    }

    /**
     * Create a ComputePipelineBuilder for creating a ComputePipeline.
     */
    createComputePipeline(): ComputePipelineBuilder
    {
        return new ComputePipelineBuilder(this._context);
    }

    /**
     * Create a SamplerBuilder for creating a Sampler.
     */
    createSampler(): SamplerBuilder
    {
        return new SamplerBuilder(this._context);
    }

    /**
     * Create a TextureBuilder for creating a Texture.
     */
    createTexture(): TextureBuilder
    {
        return new TextureBuilder(this._context)
    }

    /**
     * Creates a command encoder for recording GPU commands for the current frame.
     * @param label - Optional debug label to assign to the encoder
     */
    createCommandEncoder(label?: string): CommandEncoder {
        return new CommandEncoder(this.backbufferTarget, this._depthStencilTarget, this._context, label);
    }

    /**
     * Create a UniformBufferLayoutBuilder for creating a UniformBufferLayout.
     */
    createUniformBufferLayout(): UniformBufferLayoutBuilder
    {
        return new UniformBufferLayoutBuilder();
    }

    /**
     * Create a UniformBuffer for the given layout.
     */
    createUniformBuffer(layout: UniformBufferLayout): UniformBuffer
    {
        return new UniformBuffer(layout, this._context)
    }

    /**
     * Destroy the TinyHelix instance and release all GPU resources.
     */
    destroy(): void {
        this._context.destroy();
    }

    private _createDepthStencil() {
        this._depthStencil = mapUndefined(this._options.depthStencilFormat, (f) =>
            this.createTexture()
                .withFormat(f)
                .withSize(this._canvas.width, this._canvas.height)
                .withUsage(GPUTextureUsage.RENDER_ATTACHMENT)
                .build()
        );

        this._depthStencilTarget = mapUndefined(this._depthStencil, (t) =>
            this.createRenderTarget(t)
                .build()
        );
    }
}
