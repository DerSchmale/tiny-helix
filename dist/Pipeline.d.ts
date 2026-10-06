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
export declare class Pipeline {
    private _context;
    private _pipeline;
    private _layout;
    /**
     * Creates a new Pipeline instance
     * @param context - The WebGPU context to use
     */
    constructor(context: WebGPUContext);
    /**
     * Gets the underlying WebGPU render pipeline
     */
    get pipeline(): GPURenderPipeline | null;
    /**
     * Gets the pipeline layout
     */
    get layout(): GPUPipelineLayout | null;
    /**
     * Creates the render pipeline
     * @param options - Pipeline configuration options
     * @throws Error if device is not initialized
     */
    create(options: PipelineOptions): void;
    /**
     * Destroys the pipeline and releases resources
     */
    destroy(): void;
}
