import {WebGPUContext, WebGPUContextOptions} from './WebGPUContext';
import {CommandEncoder} from "./CommandEncoder";
import {Texture} from "./Texture";
import {RenderTarget, RenderTargetBuilder} from "./RenderTarget";
import {ShaderBuilder} from "./Shader";
import {RenderPipelineBuilder} from "./RenderPipeline";
import {MeshBuilder} from "./Mesh";
import {UniformBuffer, UniformBufferLayout, UniformBufferLayoutBuilder} from "./buffers/UniformBuffer";

/**
 * Options for initializing TinyHelix
 */
export interface TinyHelixOptions extends WebGPUContextOptions {
    // Possible to add more options later
    /** Optional format to use for the depth/stencil buffer */
    depthStencilFormat?: GPUTextureFormat;
}

/**
 * Main entry point for the tiny-helix API. Manages the WebGPU context,
 * backbuffer and provides helpers to create render targets and command encoders.
 */
export class TinyHelix {
    private _context: WebGPUContext;
    private _options: TinyHelixOptions = {};
    private _backbuffer: Texture | null = null;
    private _backbufferTarget: RenderTarget | null = null;

    /**
     * Create a new TinyHelix instance. Call `initialize()` before rendering.
     */
    constructor() {
        this._context = new WebGPUContext();
    }

    /**
     * Initializes the underlying WebGPU context and prepares resources.
     * @param options - Configuration options forwarded to the WebGPU context
     * @example await tiny.initialize({ canvas: myCanvas });
     */
    async initialize(options: TinyHelixOptions = {}) {
        this._options = options;

        await this._context.initialize(options);

        if (options.depthStencilFormat) {
            // TODO: Create depth texture
        }
    }

    /**
     * Return the chosen depth/stencil format if configured.
     */
    depthStencilFormat(): GPUTextureFormat | undefined {
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
        this._backbufferTarget = this.createRenderTarget(this._backbuffer).build();
    }

    /**
     * Create a RenderTargetBuilder for a given texture.
     */
    createRenderTarget(texture: Texture): RenderTargetBuilder
    {
        return new RenderTargetBuilder(texture);
    }

    /**
     * Create a ShaderBuilder for creating a Shader.
     */
    createShader(): ShaderBuilder
    {
        return new ShaderBuilder(this._context);
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
        return new RenderPipelineBuilder(this._context);
    }

    /**
     * Creates a command encoder for recording GPU commands for the current frame.
     * @param label - Optional debug label to assign to the encoder
     */
    createCommandEncoder(label?: string): CommandEncoder {
        return new CommandEncoder(this.backbufferTarget, this._context, label);
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
}
