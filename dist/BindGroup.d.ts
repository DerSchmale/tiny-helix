/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import { UniformBuffer, UniformBufferLayout } from "./buffers/UniformBuffer";
import { IBuffer } from "./buffers/IBuffer";
import { Texture, TextureView } from "./Texture";
import { Sampler } from "./Sampler";
import { TextureFormat } from "../dist";
import { StorageTextureAccess } from "./enums";
/**
 * Lightweight wrapper around a GPUBindGroup.
 * Use {@link TinyHelix.createBindGroup} to create instances.
 */
export declare class BindGroup {
    _inner: GPUBindGroup;
    /**
     * Construct a wrapper around an existing GPUBindGroup.
     * @internal
     */
    constructor(inner: GPUBindGroup);
}
/**
 * Builder for creating GPUBindGroup instances. Supports adding uniform buffer
 * entries and a human-readable label.
 */
export declare class BindGroupBuilder {
    private _entries;
    private _label?;
    private _layout;
    private _ctx;
    /**
     * @internal
     */
    constructor(ctx: WebGPUContext, layout: BindGroupLayout);
    /**
     * Assign a human-readable label for the bind group (useful in GPU debuggers).
     */
    withLabel(label: string): this;
    /**
     * Attach a buffer to the bind group
     * @param fieldName
     * @param buffer
     */
    withBuffer(fieldName: string, buffer: IBuffer): this;
    /** Attach a texture to the bind group. */
    withTexture(fieldName: string, texture: Texture | TextureView): this;
    /** Attach a sampler to the bind group at the given binding index. */
    withSampler(fieldName: string, sampler: Sampler): this;
    /**
     * Create the GPUBindGroup and return a wrapped `BindGroup` instance.
     */
    build(): BindGroup;
}
/**
 * Wrapper around a GPUBindGroupLayout that also keeps track of any
 * UniformBufferLayout objects associated with the layout. Useful for
 * constructing `BindGroupBuilder` instances for specific layouts.
 */
export declare class BindGroupLayout {
    /** @internal */
    readonly _inner: GPUBindGroupLayout;
    private _uboLayouts;
    private _ctx;
    private _indices;
    constructor(inner: GPUBindGroupLayout, ctx: WebGPUContext, indices: Map<string, number>, uboLayouts: Map<string, UniformBufferLayout>);
    /**
     * Get the UniformBufferLayout associated with a named field (if any).
     */
    getUniformBufferLayout(name: string): UniformBufferLayout | undefined;
    createUniformBuffer(name: string): UniformBuffer | undefined;
    _getBindingIndex(fieldName: string): number;
}
/**
 * Builder for GPUBindGroupLayout. Currently supports adding uniform buffers
 * and their associated layout information.
 */
declare class BindGroupLayoutBuilder {
    private _entries;
    private _indices;
    private _uboLayouts;
    private _label?;
    private _ctx;
    constructor(ctx: WebGPUContext);
    /**
     * Assign a label for the bind group layout.
     */
    withLabel(label: string): this;
    /**
     * Add a uniform buffer binding at the given index and record its layout.
     * @param index - binding index
     * @param field_name - a name used to reference the layout later
     * @param layout - the UniformBufferLayout describing the UBO
     * @param visibility - shader stage visibility flags (defaults to VERTEX|FRAGMENT|COMPUTE)
     */
    withUniformBuffer(index: number, field_name: string, layout: UniformBufferLayout, visibility?: GPUShaderStageFlags): this;
    /**
     * Add a storage buffer binding at the given index and record its layout.
     * @param index - binding index
     * @param field_name - a name used to reference the layout later
     * @param visibility - shader stage visibility flags (defaults to FRAGMENT|COMPUTE)
     */
    withStorageBuffer(index: number, field_name: string, visibility?: GPUShaderStageFlags): this;
    /**
     * Add a storage texture binding at the given index. The texture will be
     * write-only and use RGBA8Unorm format.
     * @param index
     * @param field_name
     * @param format
     * @param access_mode
     * @param visibility
     */
    withStorageTexture(index: number, field_name: string, format: TextureFormat, access_mode: StorageTextureAccess, visibility?: GPUShaderStageFlags): this;
    withTexture(index: number, field_name: string, visibility?: GPUShaderStageFlags): this;
    withSampler(index: number, field_name: string, visibility?: GPUShaderStageFlags): this;
    /**
     * Create the underlying GPUBindGroupLayout and return a wrapped `BindGroupLayout`.
     */
    build(): BindGroupLayout;
}
export default BindGroupLayoutBuilder;
