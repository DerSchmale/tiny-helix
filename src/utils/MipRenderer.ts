import {FilterMode} from "../enums";

import {Texture} from "../Texture";
import {WebGPUContext} from "../WebGPUContext";
import {TextureUsage} from "../buffers/Buffer";

export class MipRenderer {
    private _pipeline: GPURenderPipeline;
    private _ctx: WebGPUContext;
    private _bindgroupLayout: GPUBindGroupLayout;
    private _bindgroups: GPUBindGroup[] = [];
    private _views: GPUTextureView[] = [];
    private _passDescs: GPURenderPassDescriptor[] = [];

    constructor(ctx: WebGPUContext, shader: GPUShaderModule, texture: Texture) {
        this._ctx = ctx;

        const sampler = ctx.device.createSampler({
            label: "MipRenderer Bilinear Sampler",
            magFilter: FilterMode.Linear,
            minFilter: FilterMode.Linear,
            mipmapFilter: FilterMode.Nearest
        });

        this._bindgroupLayout = ctx.device.createBindGroupLayout({
            label: "MipRenderer BindGroup Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        viewDimension: texture.dimension(),
                        multisampled: false
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "filtering"
                    }
                }
            ]
        });

        this._pipeline = ctx.device.createRenderPipeline({
            label: "MipRenderer Pipeline",
            layout: ctx.device.createPipelineLayout({
                label: "MipRenderer Pipeline Layout",
                bindGroupLayouts: [this._bindgroupLayout]
            }),
            vertex: {
                module: shader,
                entryPoint: "vs_main"
            },
            fragment: {
                module: shader,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: texture.format
                    }
                ]
            },
            primitive: {
                topology: "triangle-list",
                stripIndexFormat: undefined,
                frontFace: "ccw",
                cullMode: "none"
            }
        });

        for (let level = 0; level < texture.mipLevelCount; ++level) {
            this._views.push(
                texture.createView()
                    .withSingleMip(level)
                    .withUsage(TextureUsage.RenderAttachment)
                    .withUsage(TextureUsage.TextureBinding)
                    .build()._inner
            );

            if (level === 0) continue;

            this._bindgroups.push(ctx.device.createBindGroup({
                label: `MipRenderer BindGroup Mip ${level}`,
                layout: this._bindgroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: this._views[level - 1]
                    },
                    {
                        binding: 1,
                        resource: sampler
                    }
                ]
            }));

            this._passDescs.push({
                label: `MipRenderer Render Pass mip ${level}`,
                colorAttachments: [{
                    view: this._views[level],
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: {r: 0, g: 0, b: 0, a: 0}
                }]
            });
        }
    }

    render() {
        const encoder = this._ctx.device.createCommandEncoder({
            label: "MipRenderer Command Encoder"
        });

        this._passDescs.forEach((desc, level) => {
            const pass = encoder.beginRenderPass(desc);
            pass.setPipeline(this._pipeline);
            pass.setBindGroup(0, this._bindgroups[level]);
            pass.draw(3, 1, 0, 0);
            pass.end();
        });

        this._ctx.device.queue.submit([encoder.finish()]);
    }
}