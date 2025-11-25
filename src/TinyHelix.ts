import { WebGPUContext, WebGPUContextOptions } from './WebGPUContext';
import { Renderer } from './Renderer';
import { Pipeline, PipelineOptions } from './Pipeline';
import { Buffer, BufferOptions } from './Buffer';

/**
 * Options for initializing TinyHelix
 */
export interface TinyHelixOptions extends WebGPUContextOptions {
  /** Whether to auto-initialize on construction (default: false) */
  autoInit?: boolean;
}

/**
 * Main entry point for the tiny-helix WebGPU library
 * Provides a unified interface for WebGPU operations
 */
export class TinyHelix {
  private _context: WebGPUContext;
  private _renderer: Renderer | null = null;
  private _initialized: boolean = false;

  /**
   * Creates a new TinyHelix instance
   * @param options - Configuration options
   */
  constructor(options: TinyHelixOptions = {}) {
    this._context = new WebGPUContext();
    
    if (options.autoInit) {
      this.initialize(options);
    }
  }

  /**
   * Gets the WebGPU context
   */
  get context(): WebGPUContext {
    return this._context;
  }

  /**
   * Gets the renderer instance
   */
  get renderer(): Renderer | null {
    return this._renderer;
  }

  /**
   * Gets the WebGPU device
   */
  get device(): GPUDevice | null {
    return this._context.device;
  }

  /**
   * Returns whether the library is initialized
   */
  get initialized(): boolean {
    return this._initialized;
  }

  /**
   * Checks if WebGPU is supported
   */
  static isSupported(): boolean {
    return WebGPUContext.isSupported();
  }

  /**
   * Initializes the WebGPU context and renderer
   * @param options - Configuration options
   */
  async initialize(options: TinyHelixOptions = {}): Promise<void> {
    if (this._initialized) {
      return;
    }

    await this._context.initialize(options);
    this._renderer = new Renderer(this._context);
    this._initialized = true;
  }

  /**
   * Creates a new render pipeline
   * @param options - Pipeline configuration
   * @returns A new Pipeline instance
   */
  createPipeline(options: PipelineOptions): Pipeline {
    const pipeline = new Pipeline(this._context);
    pipeline.create(options);
    return pipeline;
  }

  /**
   * Creates a new GPU buffer
   * @param options - Buffer configuration
   * @returns A new Buffer instance
   */
  createBuffer(options: BufferOptions): Buffer {
    const buffer = new Buffer(this._context);
    buffer.create(options);
    return buffer;
  }

  /**
   * Creates a new GPU buffer with initial data
   * @param data - Initial data for the buffer
   * @param usage - Buffer usage flags
   * @param label - Optional label for debugging
   * @returns A new Buffer instance
   */
  createBufferWithData(
    data: ArrayBuffer | ArrayBufferView,
    usage: GPUBufferUsageFlags,
    label?: string
  ): Buffer {
    const buffer = new Buffer(this._context);
    buffer.createWithData(data, usage, label);
    return buffer;
  }

  /**
   * Destroys the TinyHelix instance and releases all resources
   */
  destroy(): void {
    this._renderer = null;
    this._context.destroy();
    this._initialized = false;
  }
}
