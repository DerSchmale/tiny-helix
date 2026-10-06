/// <reference types="@webgpu/types" />
import { BindGroup } from "./BindGroup";
import { ComputePipeline } from "./ComputePipeline";
import { Buffer } from "./buffers/Buffer";
export declare class ComputePass {
    private readonly _inner;
    constructor(inner: GPUComputePassEncoder);
    /**
     * Set the compute pipeline to use for the next dispatch calls.
     * @param pipeline
     */
    setPipeline(pipeline: ComputePipeline): this;
    dispatch(x: GPUSize32, y?: GPUSize32, z?: GPUSize32): this;
    dispatchIndirect(buffer: Buffer, offset: number): this;
    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index: number, bindGroup: BindGroup): this;
    /**
     * End the compute pass. After calling end(), the underlying encoder may
     * continue recording other passes or be finished/submitted.
     */
    end(): void;
}
export declare class ComputePassBuilder {
    private _label?;
    private _encoder;
    private _globalBindGroups;
    constructor(encoder: GPUCommandEncoder, globalBindGroups: BindGroup[]);
    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label: string): this;
    build(): ComputePass;
}
