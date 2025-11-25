import { WebGPUContext } from './WebGPUContext';

/**
 * Options for creating a render pipeline
 */
export interface PipelineOptions {
  /** Vertex shader WGSL code */
  vertexShader: string;
  /** Fragment shader WGSL code */
  fragmentShader: string;
  /** Vertex buffer layouts */
  vertexBufferLayouts?: GPUVertexBufferLayout[];
  /** Primitive topology (default: 'triangle-list') */
  topology?: GPUPrimitiveTopology;
  /** Bind group layouts for the pipeline */
  bindGroupLayouts?: GPUBindGroupLayout[];
}

/**
 * Wrapper for WebGPU render pipeline creation and management
 */
export class Pipeline {
  private _context: WebGPUContext;
  private _pipeline: GPURenderPipeline | null = null;
  private _layout: GPUPipelineLayout | null = null;

  /**
   * Creates a new Pipeline instance
   * @param context - The WebGPU context to use
   */
  constructor(context: WebGPUContext) {
    this._context = context;
  }

  /**
   * Gets the underlying WebGPU render pipeline
   */
  get pipeline(): GPURenderPipeline | null {
    return this._pipeline;
  }

  /**
   * Gets the pipeline layout
   */
  get layout(): GPUPipelineLayout | null {
    return this._layout;
  }

  /**
   * Creates the render pipeline
   * @param options - Pipeline configuration options
   * @throws Error if device is not initialized
   */
  create(options: PipelineOptions): void {
    const device = this._context.device;
    if (!device) {
      throw new Error('WebGPU device not initialized');
    }

    // Create shader modules
    const vertexModule = device.createShaderModule({
      code: options.vertexShader,
    });

    const fragmentModule = device.createShaderModule({
      code: options.fragmentShader,
    });

    // Create pipeline layout
    if (options.bindGroupLayouts) {
      this._layout = device.createPipelineLayout({
        bindGroupLayouts: options.bindGroupLayouts,
      });
    }

    // Create render pipeline
    this._pipeline = device.createRenderPipeline({
      layout: this._layout ?? 'auto',
      vertex: {
        module: vertexModule,
        entryPoint: 'main',
        buffers: options.vertexBufferLayouts ?? [],
      },
      fragment: {
        module: fragmentModule,
        entryPoint: 'main',
        targets: [
          {
            format: this._context.format,
          },
        ],
      },
      primitive: {
        topology: options.topology ?? 'triangle-list',
      },
    });
  }

  /**
   * Destroys the pipeline and releases resources
   */
  destroy(): void {
    this._pipeline = null;
    this._layout = null;
  }
}
