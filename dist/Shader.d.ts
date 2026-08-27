/// <reference types="@webgpu/types" />
import { WebGPUContext } from "./WebGPUContext";
import BindGroupLayoutBuilder, { BindGroupBuilder, BindGroupLayout } from "./BindGroup";
type AttributeMap = Map<string, number>;
/**
 * Wrapper around GPUShaderModule. Keeps a map of vertex attribute names to
 * shader locations to aid pipeline construction.
 */
export declare class Shader {
    /** @internal */
    readonly _inner: GPUShaderModule;
    /** @internal */
    readonly _bindGroupLayouts: BindGroupLayout[] | undefined;
    private _vertexAttributes;
    private _ctx;
    /**
     * @internal
     */
    constructor(inner: GPUShaderModule, ctx: WebGPUContext, vertexAttributes: AttributeMap, bindGroupLayouts?: BindGroupLayout[]);
    getCompilationInfo(): Promise<GPUCompilationInfo>;
    /**
     * Get the shader location for a named vertex attribute. Returns undefined if the attribute
     * is not declared by the shader.
     */
    getVertexAttributeLocation(name: string): number | undefined;
    /**
     * Returns true if the shader declares a vertex attribute with the given name.
     * @param name
     */
    hasVertexAttribute(name: string): boolean;
    /**
     * Create a BindGroupBuilder for the shader's bind group at the given index.
     * @param group - index of the bind group declared by the shader
     */
    createBindGroup(group: number): BindGroupBuilder;
}
/**
 * Builder for creating shader modules and declaring attribute locations used by the helper
 * pipeline builder.
 */
export declare class ShaderBuilder {
    private _code?;
    private _label?;
    private _ctx;
    private _vertexAttributes;
    private _bindGroupLayouts;
    private _includes;
    /**
     * @internal
     */
    constructor(ctx: WebGPUContext);
    /** Optional label for the underlying GPUShaderModule. */
    withLabel(label: string): this;
    /** Set WGSL or other shader code to compile into a GPUShaderModule. */
    withCode(code: string): this;
    /**
     * Add a named include to the shader code. The include will be expanded
     * in the shader code before compilation. The include name must be unique
     * within the shader code. This allows using `#include<name>` in the shader
     * code to include other files. While this is not standard WGSL, it's too
     * useful not to support.
     *
     * @param name - The name as used in the `#include<name>` directive.
     * @param code - The code the include should expand to.
     */
    withInclude(name: string, code: string): this;
    /** Declare a named vertex attribute and the location it maps to in the shader. */
    withVertexAttribute(location: number, name: string): this;
    /**
     * Declare a bind group layout used by this shader. The provided builder
     * callback is used to construct the layout description.
     */
    withBindGroup(index: number, layout: BindGroupLayout): this;
    withBindGroup(index: number, buildFunc: (builder: BindGroupLayoutBuilder) => void): this;
    /** Compile the shader module and return a `Shader` instance. */
    build(): Shader;
}
export {};
