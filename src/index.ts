/**
 * tiny-helix: A TypeScript library for WebGPU
 * @packageDocumentation
 */

export { TinyHelix, type TinyHelixOptions } from './TinyHelix';
export { WebGPUContext, type WebGPUContextOptions } from './WebGPUContext';

// Default export for convenience
import { TinyHelix } from './TinyHelix';
export default TinyHelix;

export * from './CommandEncoder';
export * from './RenderPass';
export * from './RenderPipeline';
export * from './RenderTarget';
export * from './Shader';
export * from './Texture';
