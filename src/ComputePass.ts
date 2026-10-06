import {BindGroup} from "./BindGroup";
import {ComputePipeline} from "./ComputePipeline";
import {Buffer} from "./buffers/Buffer";

export class ComputePass
{
    private readonly _inner: GPUComputePassEncoder;

    constructor(inner: GPUComputePassEncoder) {
        this._inner = inner;

    }

    /**
     * Set the compute pipeline to use for the next dispatch calls.
     * @param pipeline
     */
    setPipeline(pipeline: ComputePipeline): this {
        this._inner.setPipeline(pipeline._inner);
        return this;
    }

    dispatch(x: GPUSize32, y?: GPUSize32, z?: GPUSize32): this
    {
        this._inner.dispatchWorkgroups(x, y, z)
        return this;
    }

    dispatchIndirect(buffer: Buffer, offset: number): this
    {
        this._inner.dispatchWorkgroupsIndirect(buffer._inner, offset);
        return this;
    }

    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index: number, bindGroup: BindGroup): this
    {
        this._inner.setBindGroup(index, bindGroup._inner);
        return this;
    }

    /**
     * End the compute pass. After calling end(), the underlying encoder may
     * continue recording other passes or be finished/submitted.
     */
    end() {
        this._inner.end();
    }
}

export class ComputePassBuilder
{
    private _label?: string;
    private _encoder: GPUCommandEncoder;
    private _globalBindGroups: BindGroup[];

    constructor(encoder: GPUCommandEncoder, globalBindGroups: BindGroup[]) {
        this._encoder = encoder;
        this._globalBindGroups = globalBindGroups;
    }

    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label: string): this {
        this._label = label;
        return this;
    }

    build(): ComputePass {
        const desc: GPUComputePassDescriptor = {
            label: this._label
        };

        const pass = new ComputePass(this._encoder.beginComputePass(desc));
        for (let i = 0; i < this._globalBindGroups.length; ++i) {
            pass.setBindGroup(i, this._globalBindGroups[i]);
        }
        return pass;
    }
}