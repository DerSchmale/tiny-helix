import {WebGPUContext} from "./WebGPUContext";
import {UniformBuffer, UniformBufferLayout} from "./buffers/UniformBuffer";
import {IBuffer} from "./buffers/IBuffer";
import {mapUndefined} from "./utils/mapUndefined";

/**
 * Lightweight wrapper around a GPUBindGroup.
 * Use {@link TinyHelix.createBindGroup} to create instances.
 */
export class BindGroup {
    _inner: GPUBindGroup;

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
     * Attach a uniform buffer to the bind group at the given binding index.
     * @param index - binding index in the bind group layout
     * @param buffer - an object implementing IBuffer (provides underlying GPUBuffer)
     */
    withUniformBuffer(index: number, buffer: IBuffer): this {
        this._entries[index] = {
            binding: index, resource: { buffer: buffer._getBuffer()._inner }
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
    _inner: GPUBindGroupLayout;
    private _uboLayouts: Map<string, UniformBufferLayout>;
    private _ctx: WebGPUContext;

    constructor(inner: GPUBindGroupLayout, ctx: WebGPUContext, uboLayouts: Map<string, UniformBufferLayout>) {
        this._inner = inner;
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
        mapUndefined(layout, layout => new UniformBuffer(layout, this._ctx));
        return
    }
    // TODO: Should we be able to create a bind group builder from this?
    // Or UniformBuffers?
}

/**
 * Builder for GPUBindGroupLayout. Currently supports adding uniform buffers
 * and their associated layout information.
 */
export class BindGroupLayoutBuilder {
    private _entries: GPUBindGroupLayoutEntry[] = [];
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
            visibility: visibility ?? GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: {type: 'uniform'}
        };
        this._uboLayouts.set(field_name, layout);
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
        return new BindGroupLayout(inner, this._ctx, this._uboLayouts)
    }
}
