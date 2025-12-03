import {WebGPUContext} from "./WebGPUContext";
import {UniformBufferLayout} from "./buffers/UniformBuffer";
import {IBuffer} from "./buffers/IBuffer";

export class BindGroup {
    _inner: GPUBindGroup;

    constructor(inner: GPUBindGroup) {
        this._inner = inner;
    }
}

export class BindGroupBuilder {
    private _entries: GPUBindGroupEntry[] = [];
    private _label?: string;
    private _layout: BindGroupLayout;
    private _ctx: WebGPUContext;

    constructor(ctx: WebGPUContext, layout: BindGroupLayout) {
        this._ctx = ctx;
        this._layout = layout;
    }

    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    withUniformBuffer(index: number, buffer: IBuffer): this {
        this._entries[index] = {
            binding: index, resource: { buffer: buffer._getBuffer()._inner }
        };
        return this;
    }

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

export class BindGroupLayout {
    /** @internal */
    _inner: GPUBindGroupLayout;
    private _uboLayouts: Map<string, UniformBufferLayout>;

    constructor(inner: GPUBindGroupLayout, uboLayouts: Map<string, UniformBufferLayout>) {
        this._inner = inner;
        this._uboLayouts = uboLayouts;
    }

    // TODO: Should we be able to create a bind group builder from this?
    // Or UniformBuffers?
}

export class BindGroupLayoutBuilder {
    private _entries: GPUBindGroupLayoutEntry[] = [];
    // TODO: add other buffer/texture types
    private _uboLayouts: Map<string, UniformBufferLayout> = new Map();
    private _label?: string;
    private _ctx: WebGPUContext;

    constructor(ctx: WebGPUContext) {
        this._ctx = ctx;
    }

    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    withUniformBuffer(index: number, field_name: string, layout: UniformBufferLayout, visibility?: GPUShaderStageFlags): this {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: {type: 'uniform'}
        };
        this._uboLayouts.set(field_name, layout);
        return this;
    }

    build(): BindGroupLayout
    {
        const inner = this._ctx.device.createBindGroupLayout({
            label: this._label,
            entries: this._entries
        });
        return new BindGroupLayout(inner, this._uboLayouts)
    }
}
