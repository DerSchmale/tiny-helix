/**
 * tiny-helix: A TypeScript library for WebGPU
 * @packageDocumentation
 */

export {TinyHelix, type TinyHelixOptions} from "./TinyHelix";
export {WebGPUContext, type WebGPUContextOptions} from "./WebGPUContext";

// Default export for convenience
import {TinyHelix} from "./TinyHelix";

export default TinyHelix;

export * from "./BindGroup";
export * from "./CommandEncoder";
export * from "./enums";
export * from "./Mesh";
export * from "./RenderPass";
export * from "./RenderPipeline";
export * from "./RenderTarget";
export * from "./Sampler";
export * from "./Shader";
export * from "./Texture";
export * from "./buffers/Buffer";
export * from "./buffers/UniformBuffer";
export * from "./buffers/BufferDataWriter"
