import { WebGPUContext } from './WebGPUContext';

/**
 * Options for creating a GPU buffer
 */
export interface BufferOptions {
  /** Size of the buffer in bytes */
  size: number;
  /** Usage flags for the buffer */
  usage: GPUBufferUsageFlags;
  /** Whether the buffer should be mappable at creation */
  mappedAtCreation?: boolean;
  /** Optional label for debugging */
  label?: string;
}

/**
 * Wrapper for WebGPU buffer creation and management
 */
export class Buffer {
  private _context: WebGPUContext;
  private _buffer: GPUBuffer | null = null;
  private _size: number = 0;

  /**
   * Creates a new Buffer instance
   * @param context - The WebGPU context to use
   */
  constructor(context: WebGPUContext) {
    this._context = context;
  }

  /**
   * Gets the underlying WebGPU buffer
   */
  get buffer(): GPUBuffer | null {
    return this._buffer;
  }

  /**
   * Gets the buffer size in bytes
   */
  get size(): number {
    return this._size;
  }

  /**
   * Creates the GPU buffer
   * @param options - Buffer configuration options
   * @throws Error if device is not initialized
   */
  create(options: BufferOptions): void {
    const device = this._context.device;
    if (!device) {
      throw new Error('WebGPU device not initialized');
    }

    this._size = options.size;
    this._buffer = device.createBuffer({
      size: options.size,
      usage: options.usage,
      mappedAtCreation: options.mappedAtCreation ?? false,
      label: options.label,
    });
  }

  /**
   * Creates a buffer with initial data
   * @param data - The data to upload to the buffer
   * @param usage - Usage flags for the buffer
   * @param label - Optional label for debugging
   * @throws Error if device is not initialized
   */
  createWithData(
    data: ArrayBuffer | ArrayBufferView,
    usage: GPUBufferUsageFlags,
    label?: string
  ): void {
    const device = this._context.device;
    if (!device) {
      throw new Error('WebGPU device not initialized');
    }

    const arrayBuffer = ArrayBuffer.isView(data) ? data.buffer : data;
    const byteOffset = ArrayBuffer.isView(data) ? data.byteOffset : 0;
    const byteLength = ArrayBuffer.isView(data) ? data.byteLength : data.byteLength;

    this._size = byteLength;
    this._buffer = device.createBuffer({
      size: byteLength,
      usage: usage | GPUBufferUsage.COPY_DST,
      label,
    });

    device.queue.writeBuffer(
      this._buffer,
      0,
      arrayBuffer,
      byteOffset,
      byteLength
    );
  }

  /**
   * Updates the buffer data
   * @param data - The data to upload
   * @param offset - Offset in bytes (default: 0)
   * @throws Error if buffer is not created
   */
  update(data: ArrayBuffer | ArrayBufferView, offset: number = 0): void {
    const device = this._context.device;
    if (!device || !this._buffer) {
      throw new Error('Buffer not initialized');
    }

    const arrayBuffer = ArrayBuffer.isView(data) ? data.buffer : data;
    const byteOffset = ArrayBuffer.isView(data) ? data.byteOffset : 0;
    const byteLength = ArrayBuffer.isView(data) ? data.byteLength : data.byteLength;

    device.queue.writeBuffer(
      this._buffer,
      offset,
      arrayBuffer,
      byteOffset,
      byteLength
    );
  }

  /**
   * Destroys the buffer and releases resources
   */
  destroy(): void {
    if (this._buffer) {
      this._buffer.destroy();
      this._buffer = null;
    }
    this._size = 0;
  }
}
