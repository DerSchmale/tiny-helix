import {WebGPUContext, WebGPUContextOptions} from './WebGPUContext';

/**
 * Options for initializing TinyHelix
 */
export interface TinyHelixOptions extends WebGPUContextOptions {
    // Possible to add more options later
}

/**
 * Main entry point for the tiny-helix API
 */
export class TinyHelix {
  private _context: WebGPUContext;

  /**
   * Creates a new TinyHelix instance
   * @param options - Configuration options
   */
  constructor() {
    this._context = new WebGPUContext();
  }

  /**
   * Destroys the TinyHelix instance and releases all resources
   */
  destroy(): void {
    this._context.destroy();
  }
}
