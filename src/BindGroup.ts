import {WebGPUContext} from "./WebGPUContext";
import {UniformBuffer, UniformBufferLayout} from "./buffers/UniformBuffer";
import {IBuffer} from "./buffers/IBuffer";
import {mapUndefined} from "./utils/mapUndefined";
import {Texture, TextureView} from "./Texture";
import {Sampler} from "./Sampler";
import {TextureFormat} from "../dist";
import {SamplerType, ShaderStage, StorageAccess, TextureSampleType, TextureViewDimension} from "./enums";

/**
 * Lightweight wrapper around a GPUBindGroup.
 * Use {@link TinyHelix.createBindGroup} to create instances.
 */
export class BindGroup {
    /** @internal */
    readonly _inner: GPUBindGroup;

    /**
     * Construct a wrapper around an existing GPUBindGroup.
     * @internal
     */
    constructor(inner: GPUBindGroup) {
        this._inner = inner;
    }
}

/**
 * Builder for creating GPUBindGroup instances. Supports adding uniform buffer
 * entries and a human-readable label.
 */
export class BindGroupBuilder {
    private _entries: GPUBindGroupEntry[] = [];
    private _label?: string;
    private _layout: BindGroupLayout;
    private _ctx: WebGPUContext;

    /**
     * @internal
     */
    constructor(ctx: WebGPUContext, layout: BindGroupLayout) {
        this._ctx = ctx;
        this._layout = layout;
    }

    /**
     * Assign a human-readable label for the bind group (useful in GPU debuggers).
     */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    /**
     * Attach a buffer to the bind group
     * @param fieldName
     * @param buffer
     */
    withBuffer(fieldName: string, buffer: IBuffer): this {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: buffer._getBufferResource()
        };
        return this;
    }

    /** Attach a texture to the bind group. */
    withTexture(fieldName: string, texture: TextureView): this {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: texture._inner,
        };
        return this;
    }

    /** Attach a sampler to the bind group at the given binding index. */
    withSampler(fieldName: string, sampler: Sampler): this {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: sampler._inner
        };
        return this;
    }

    /**
     * Create the GPUBindGroup and return a wrapped `BindGroup` instance.
     */
    build(): BindGroup
    {
        const inner = this._ctx.device.createBindGroup({
            label: this._label,
            entries: this._entries,
            layout: this._layout._inner
        });
        return new BindGroup(inner);
    }
}

/**
 * Wrapper around a GPUBindGroupLayout that also keeps track of any
 * UniformBufferLayout objects associated with the layout. Useful for
 * constructing `BindGroupBuilder` instances for specific layouts.
 */
export class BindGroupLayout {
    /** @internal */
    readonly _inner: GPUBindGroupLayout;
    private _uboLayouts: Map<string, UniformBufferLayout>;
    private _ctx: WebGPUContext;
    private _indices: Map<string, number>;

    constructor(inner: GPUBindGroupLayout, ctx: WebGPUContext, indices: Map<string, number>, uboLayouts: Map<string, UniformBufferLayout>) {
        this._inner = inner;
        this._indices = indices;
        this._uboLayouts = uboLayouts;
        this._ctx = ctx;
    }

    /**
     * Get the UniformBufferLayout associated with a named field (if any).
     */
    getUniformBufferLayout(name: string): UniformBufferLayout | undefined {
        return this._uboLayouts.get(name);
    }

    createUniformBuffer(name: string): UniformBuffer | undefined
    {
        const layout = this._uboLayouts.get(name);
        return mapUndefined(layout, layout => new UniformBuffer(layout, this._ctx));
    }

    _getBindingIndex(fieldName: string): number
    {
        const index = this._indices.get(fieldName);
        if (index === undefined) {
            throw(`No field name found for ${fieldName} in bind group layout.`);
        }
        return index;
    }
}

/**
 * Builder for GPUBindGroupLayout. Currently supports adding uniform buffers
 * and their associated layout information.
 */
class BindGroupLayoutBuilder {
    private _entries: GPUBindGroupLayoutEntry[] = [];
    private _indices: Map<string, number> = new Map();
    // TODO: add other buffer/texture types
    private _uboLayouts: Map<string, UniformBufferLayout> = new Map();
    private _label?: string;
    private _ctx: WebGPUContext;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    /**
     * Assign a label for the bind group layout.
     */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    /**
     * Add a uniform buffer binding at the given index and record its layout.
     * @param index - binding index
     * @param field_name - a name used to reference the layout later
     * @param layout - the UniformBufferLayout describing the UBO
     * @param visibility - shader stage visibility flags (defaults to VERTEX|FRAGMENT|COMPUTE)
     */
    withUniformBuffer(index: number, field_name: string, layout: UniformBufferLayout, visibility?: GPUShaderStageFlags): this {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? ShaderStage.Vertex | ShaderStage.Fragment | ShaderStage.Compute,
            buffer: {type: 'uniform'}
        };
        this._indices.set(field_name, index);
        this._uboLayouts.set(field_name, layout);
        return this;
    }

    /**
     * Add a storage buffer binding at the given index and record its layout.
     * @param index - binding index
     * @param fieldName - a name used to reference the layout later
     * @param accessMode - Defines whether the storage buffer is read-only or not.
     * @param visibility - shader stage visibility flags (defaults to FRAGMENT|COMPUTE)
     */
    withStorageBuffer(index: number, fieldName: string, accessMode: StorageAccess, minBindingSize: number = 4, visibility?: GPUShaderStageFlags): this {
        let type: GPUBufferBindingType = "storage";

        if (accessMode === StorageAccess.Read) {
            type = "read-only-storage";
        }

        this._entries[index] = {
            binding: index,
            visibility: visibility ?? ShaderStage.Fragment | ShaderStage.Compute,
            buffer: {type, hasDynamicOffset: false, minBindingSize}
        };
        this._indices.set(fieldName, index);
        return this;
    }

    /**
     * Add a storage texture binding at the given index. The texture will be
     * write-only and use RGBA8Unorm format.
     * @param index
     * @param fieldName
     * @param format
     * @param accessMode
     * @param visibility
     * @param viewDimension
     */
    withStorageTexture(index: number, fieldName: string, format: TextureFormat, accessMode: StorageAccess, visibility?: GPUShaderStageFlags, viewDimension?: TextureViewDimension): this {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? ShaderStage.Fragment | ShaderStage.Compute,
            storageTexture: {
                access: accessMode,
                format,
                viewDimension: viewDimension ?? "2d"
            }
        };
        this._indices.set(fieldName, index);
        return this;
    }

    withTexture(index: number, fieldName: string, visibility?: GPUShaderStageFlags, viewDimension?: TextureViewDimension, sampleType: TextureSampleType = TextureSampleType.Float): this {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? ShaderStage.Fragment | ShaderStage.Compute,
            texture: {
                sampleType,
                viewDimension: viewDimension ?? "2d"
            }
        };
        this._indices.set(fieldName, index);
        return this;
    }

    withSampler(index: number, fieldName: string, samplerType: SamplerType = SamplerType.Filtering, visibility?: GPUShaderStageFlags): this {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? ShaderStage.Fragment | ShaderStage.Compute,
            sampler: {type: samplerType}
        };
        this._indices.set(fieldName, index);
        return this;
    }

    /**
     * Create the underlying GPUBindGroupLayout and return a wrapped `BindGroupLayout`.
     */
    build(): BindGroupLayout
    {
        const inner = this._ctx.device.createBindGroupLayout({
            label: this._label,
            entries: this._entries
        });
        return new BindGroupLayout(inner, this._ctx, this._indices, this._uboLayouts)
    }
}

export default BindGroupLayoutBuilder
