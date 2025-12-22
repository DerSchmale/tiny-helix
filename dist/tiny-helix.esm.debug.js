/******/ var __webpack_modules__ = ({

/***/ "./src/BindGroup.ts":
/*!**************************!*\
  !*** ./src/BindGroup.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BindGroup: () => (/* binding */ BindGroup),
/* harmony export */   BindGroupBuilder: () => (/* binding */ BindGroupBuilder),
/* harmony export */   BindGroupLayout: () => (/* binding */ BindGroupLayout),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buffers/UniformBuffer */ "./src/buffers/UniformBuffer.ts");
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");



/**
 * Lightweight wrapper around a GPUBindGroup.
 * Use {@link TinyHelix.createBindGroup} to create instances.
 */
class BindGroup {
    /**
     * Construct a wrapper around an existing GPUBindGroup.
     * @internal
     */
    constructor(inner) {
        this._inner = inner;
    }
}
/**
 * Builder for creating GPUBindGroup instances. Supports adding uniform buffer
 * entries and a human-readable label.
 */
class BindGroupBuilder {
    /**
     * @internal
     */
    constructor(ctx, layout) {
        this._entries = [];
        this._ctx = ctx;
        this._layout = layout;
    }
    /**
     * Assign a human-readable label for the bind group (useful in GPU debuggers).
     */
    withLabel(label) {
        this._label = label;
        return this;
    }
    /**
     * Attach a buffer to the bind group
     * @param fieldName
     * @param buffer
     */
    withBuffer(fieldName, buffer) {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: buffer._getBufferResource()
        };
        return this;
    }
    /** Attach a texture to the bind group. */
    withTexture(fieldName, texture) {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: texture._inner
        };
        return this;
    }
    /** Attach a sampler to the bind group at the given binding index. */
    withSampler(fieldName, sampler) {
        const index = this._layout._getBindingIndex(fieldName);
        this._entries[index] = {
            binding: index, resource: sampler._inner
        };
        return this;
    }
    /**
     * Create the GPUBindGroup and return a wrapped `BindGroup` instance.
     */
    build() {
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
class BindGroupLayout {
    constructor(inner, ctx, indices, uboLayouts) {
        this._inner = inner;
        this._indices = indices;
        this._uboLayouts = uboLayouts;
        this._ctx = ctx;
    }
    /**
     * Get the UniformBufferLayout associated with a named field (if any).
     */
    getUniformBufferLayout(name) {
        return this._uboLayouts.get(name);
    }
    createUniformBuffer(name) {
        const layout = this._uboLayouts.get(name);
        return (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_1__.mapUndefined)(layout, layout => new _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_0__.UniformBuffer(layout, this._ctx));
    }
    _getBindingIndex(fieldName) {
        const index = this._indices.get(fieldName);
        if (index === undefined) {
            throw (`No field name found for ${fieldName} in bind group layout.`);
        }
        return index;
    }
}
/**
 * Builder for GPUBindGroupLayout. Currently supports adding uniform buffers
 * and their associated layout information.
 */
class BindGroupLayoutBuilder {
    constructor(ctx) {
        this._entries = [];
        this._indices = new Map();
        // TODO: add other buffer/texture types
        this._uboLayouts = new Map();
        this._ctx = ctx;
    }
    /**
     * Assign a label for the bind group layout.
     */
    withLabel(label) {
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
    withUniformBuffer(index, field_name, layout, visibility) {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: { type: 'uniform' }
        };
        this._indices.set(field_name, index);
        this._uboLayouts.set(field_name, layout);
        return this;
    }
    /**
     * Add a storage buffer binding at the given index and record its layout.
     * @param index - binding index
     * @param field_name - a name used to reference the layout later
     * @param access_mode - Defines whether the storage buffer is read-only or not.
     * @param visibility - shader stage visibility flags (defaults to FRAGMENT|COMPUTE)
     */
    withStorageBuffer(index, field_name, access_mode, visibility) {
        let type = "storage";
        if (access_mode === _enums__WEBPACK_IMPORTED_MODULE_2__.StorageAccess.Read) {
            type = "read-only-storage";
        }
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            buffer: { type, hasDynamicOffset: false, minBindingSize: 4 }
        };
        this._indices.set(field_name, index);
        return this;
    }
    /**
     * Add a storage texture binding at the given index. The texture will be
     * write-only and use RGBA8Unorm format.
     * @param index
     * @param field_name
     * @param format
     * @param access_mode
     * @param visibility
     */
    withStorageTexture(index, field_name, format, access_mode, visibility) {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            storageTexture: { access: access_mode, format }
        };
        this._indices.set(field_name, index);
        return this;
    }
    withTexture(index, field_name, visibility) {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            texture: { sampleType: 'float' }
        };
        this._indices.set(field_name, index);
        return this;
    }
    withSampler(index, field_name, visibility) {
        this._entries[index] = {
            binding: index,
            visibility: visibility ?? GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
            sampler: { type: 'filtering' }
        };
        this._indices.set(field_name, index);
        return this;
    }
    /**
     * Create the underlying GPUBindGroupLayout and return a wrapped `BindGroupLayout`.
     */
    build() {
        const inner = this._ctx.device.createBindGroupLayout({
            label: this._label,
            entries: this._entries
        });
        return new BindGroupLayout(inner, this._ctx, this._indices, this._uboLayouts);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BindGroupLayoutBuilder);


/***/ }),

/***/ "./src/BlendMode.ts":
/*!**************************!*\
  !*** ./src/BlendMode.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlendMode: () => (/* binding */ BlendMode)
/* harmony export */ });
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");

class BlendMode {
    get srcFactor() { return this._inner.color.srcFactor; }
    set srcFactor(value) { this._inner.color.srcFactor = value; }
    get dstFactor() { return this._inner.color.dstFactor; }
    set dstFactor(value) { this._inner.color.dstFactor = value; }
    get alphaSrcFactor() { return this._inner.alpha.srcFactor; }
    set alphaSrcFactor(value) { this._inner.alpha.srcFactor = value; }
    get alphaDstFactor() { return this._inner.alpha.dstFactor; }
    set alphaDstFactor(value) { this._inner.alpha.dstFactor = value; }
    constructor(srcFactor, dstFactor, alphaSrcFactor, alphaDstFactor) {
        this._inner = {
            color: { srcFactor: _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.SrcAlpha, dstFactor: _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha },
            alpha: { srcFactor: _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, dstFactor: _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha }
        };
        this.srcFactor = srcFactor;
        this.dstFactor = dstFactor;
        this.alphaSrcFactor = alphaSrcFactor;
        this.alphaDstFactor = alphaDstFactor;
    }
}
BlendMode.ALPHA = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.SrcAlpha, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha);
BlendMode.ADDITIVE = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.SrcAlpha, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One);
BlendMode.MULTIPLY = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.DstColor, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.Zero, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.Zero, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One);
BlendMode.SCREEN = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcColor, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha);
BlendMode.OVERLAY = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.SrcAlpha, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha);
BlendMode.DARKEN = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcColor, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha);
BlendMode.LIGHTEN = new BlendMode(_enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcColor, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.One, _enums__WEBPACK_IMPORTED_MODULE_0__.BlendFactor.OneMinusSrcAlpha);


/***/ }),

/***/ "./src/CommandEncoder.ts":
/*!*******************************!*\
  !*** ./src/CommandEncoder.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CommandEncoder: () => (/* binding */ CommandEncoder)
/* harmony export */ });
/* harmony import */ var _RenderPass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RenderPass */ "./src/RenderPass.ts");
/* harmony import */ var _ComputePass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ComputePass */ "./src/ComputePass.ts");


/**
 * Encapsulates a GPUCommandEncoder and provides helper methods to build and
 * submit GPU commands for a single frame. CommandEncoder should only be created
 * through the TinyHelix instance (See {@link TinyHelix.createCommandEncoder})
 */
class CommandEncoder {
    /**
     * Create a new CommandEncoder bound to a backbuffer/render target and
     * the WebGPU context.
     *
     * @internal
     */
    constructor(backbufferTarget, globalBindGroups, ctx, depthStencilTarget, label) {
        this._commandBuffer = null;
        const device = ctx.device;
        this._queue = device.queue;
        this._backbufferTarget = backbufferTarget;
        this._depthStencilTarget = depthStencilTarget;
        this._globalBindGroups = globalBindGroups;
        this._encoder = device.createCommandEncoder({ label });
    }
    /**
     * Clears a buffer's contents
     */
    clearBuffer(buffer, offset, size) {
        this._encoder.clearBuffer(buffer._inner, offset, size);
        return this;
    }
    /**
     * Begin building a render pass attached to this encoder.
     * Returns a fluent RenderPassBuilder used to configure attachments and clear ops.
     */
    createRenderPass() {
        return new _RenderPass__WEBPACK_IMPORTED_MODULE_0__.RenderPassBuilder(this._encoder, this._globalBindGroups, this._backbufferTarget, this._depthStencilTarget);
    }
    /**
     * Begin building a compute pass attached to this encoder.
     * Returns a fluent ComputePassBuilder used to configure bindings and dispatch ops.
     */
    createComputePass() {
        return new _ComputePass__WEBPACK_IMPORTED_MODULE_1__.ComputePassBuilder(this._encoder, this._globalBindGroups);
    }
    /**
     * Mark the encoder as finished and finalize any pending commands.
     * Calling finish() multiple times is safe but a no-op after the first call.
     */
    finish() {
        if (!this._commandBuffer) {
            this._commandBuffer = this._encoder.finish();
        }
    }
    /**
     * Submit the recorded commands to the GPU queue. If the encoder has not
     * been finished yet, finish() will be called automatically.
     */
    submit() {
        this.finish();
        this._queue.submit([this._commandBuffer]);
    }
}


/***/ }),

/***/ "./src/ComputePass.ts":
/*!****************************!*\
  !*** ./src/ComputePass.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComputePass: () => (/* binding */ ComputePass),
/* harmony export */   ComputePassBuilder: () => (/* binding */ ComputePassBuilder)
/* harmony export */ });
class ComputePass {
    constructor(inner) {
        this._inner = inner;
    }
    /**
     * Set the compute pipeline to use for the next dispatch calls.
     * @param pipeline
     */
    setPipeline(pipeline) {
        this._inner.setPipeline(pipeline._inner);
        return this;
    }
    dispatch(x, y, z) {
        this._inner.dispatchWorkgroups(x, y, z);
        return this;
    }
    dispatchIndirect(buffer, offset) {
        this._inner.dispatchWorkgroupsIndirect(buffer._inner, offset);
        return this;
    }
    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index, bindGroup) {
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
class ComputePassBuilder {
    constructor(encoder, globalBindGroups) {
        this._encoder = encoder;
        this._globalBindGroups = globalBindGroups;
    }
    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label) {
        this._label = label;
        return this;
    }
    build() {
        const desc = {
            label: this._label
        };
        const pass = new ComputePass(this._encoder.beginComputePass(desc));
        for (let i = 0; i < this._globalBindGroups.length; ++i) {
            pass.setBindGroup(i, this._globalBindGroups[i]);
        }
        return pass;
    }
}


/***/ }),

/***/ "./src/ComputePipeline.ts":
/*!********************************!*\
  !*** ./src/ComputePipeline.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComputePipeline: () => (/* binding */ ComputePipeline),
/* harmony export */   ComputePipelineBuilder: () => (/* binding */ ComputePipelineBuilder)
/* harmony export */ });
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");

class ComputePipeline {
    constructor(inner) {
        this._inner = inner;
    }
}
class ComputePipelineBuilder {
    constructor(ctx) {
        this._ctx = ctx;
    }
    withLabel(label) {
        this._label = label;
        return this;
    }
    /** Select the shader entry point for the fragment stage. */
    withShader(shader, entry) {
        this._shader = shader;
        this._entry = entry;
        return this;
    }
    build() {
        const shader = this._shader;
        const layout = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(shader._bindGroupLayouts, bindGroupLayouts => this._ctx.device.createPipelineLayout({
            bindGroupLayouts: bindGroupLayouts.map(value => value._inner),
            label: this._label
        })) ?? "auto";
        const desc = {
            label: this._label,
            compute: {
                module: shader._inner,
                entryPoint: this._entry
            },
            layout
        };
        return new ComputePipeline(this._ctx.device.createComputePipeline(desc));
    }
}


/***/ }),

/***/ "./src/Mesh.ts":
/*!*********************!*\
  !*** ./src/Mesh.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FrontFace: () => (/* binding */ FrontFace),
/* harmony export */   IndexFormat: () => (/* binding */ IndexFormat),
/* harmony export */   Mesh: () => (/* binding */ Mesh),
/* harmony export */   MeshBuilder: () => (/* binding */ MeshBuilder),
/* harmony export */   MeshTopology: () => (/* binding */ MeshTopology),
/* harmony export */   StreamBuilder: () => (/* binding */ StreamBuilder),
/* harmony export */   VertexFormat: () => (/* binding */ VertexFormat)
/* harmony export */ });
/* harmony import */ var _buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./buffers/Buffer */ "./src/buffers/Buffer.ts");
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");


/**
 * Index buffer formats supported by the library.
 */
var IndexFormat;
(function (IndexFormat) {
    IndexFormat["Uint16"] = "uint16";
    IndexFormat["Uint32"] = "uint32";
})(IndexFormat || (IndexFormat = {}));
class IndexBuffer {
    constructor(data, ctx, keepData = false) {
        // Use BYTES_PER_ELEMENT on the union-typed array in a typed manner to avoid 'any' casts
        const bytesPerElement = data.BYTES_PER_ELEMENT;
        this.format = bytesPerElement === 2 ? IndexFormat.Uint16 : IndexFormat.Uint32;
        this.count = data.length;
        this.buffer = new _buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferBuilder(ctx)
            .withData(data.buffer, keepData)
            .withUsage(_buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferUsage.CopyDst | _buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferUsage.Index)
            .build();
    }
}
/**
 * Mesh topology enum (maps to GPU primitive topologies).
 */
var MeshTopology;
(function (MeshTopology) {
    MeshTopology["TriangleList"] = "triangle-list";
    MeshTopology["TriangleStrip"] = "triangle-strip";
    MeshTopology["LineList"] = "line-list";
    MeshTopology["LineStrip"] = "line-strip";
    MeshTopology["PointList"] = "point-list";
})(MeshTopology || (MeshTopology = {}));
/**
 * Winding mode for front-facing triangles.
 */
var FrontFace;
(function (FrontFace) {
    FrontFace["Clockwise"] = "cw";
    FrontFace["CounterClockwise"] = "ccw";
})(FrontFace || (FrontFace = {}));
/**
 * Vertex attribute formats supported by the helper. These are translated into
 * GPU vertex attribute formats when building pipelines.
 */
var VertexFormat;
(function (VertexFormat) {
    VertexFormat["Uint8"] = "uint8";
    VertexFormat["Uint8x2"] = "uint8x2";
    VertexFormat["Uint8x4"] = "uint8x4";
    VertexFormat["Sint8"] = "sint8";
    VertexFormat["Sint8x2"] = "sint8x2";
    VertexFormat["Sint8x4"] = "sint8x4";
    VertexFormat["Unorm8"] = "unorm8";
    VertexFormat["Unorm8x2"] = "unorm8x2";
    VertexFormat["Unorm8x4"] = "unorm8x4";
    VertexFormat["Snorm8"] = "snorm8";
    VertexFormat["Snorm8x2"] = "snorm8x2";
    VertexFormat["Snorm8x4"] = "snorm8x4";
    VertexFormat["Uint16"] = "uint16";
    VertexFormat["Uint16x2"] = "uint16x2";
    VertexFormat["Uint16x4"] = "uint16x4";
    VertexFormat["Sint16"] = "sint16";
    VertexFormat["Sint16x2"] = "sint16x2";
    VertexFormat["Sint16x4"] = "sint16x4";
    VertexFormat["Unorm16"] = "unorm16";
    VertexFormat["Unorm16x2"] = "unorm16x2";
    VertexFormat["Unorm16x4"] = "unorm16x4";
    VertexFormat["Snorm16"] = "snorm16";
    VertexFormat["Snorm16x2"] = "snorm16x2";
    VertexFormat["Snorm16x4"] = "snorm16x4";
    VertexFormat["Float16"] = "float16";
    VertexFormat["Float16x2"] = "float16x2";
    VertexFormat["Float16x4"] = "float16x4";
    VertexFormat["Float32"] = "float32";
    VertexFormat["Float32x2"] = "float32x2";
    VertexFormat["Float32x3"] = "float32x3";
    VertexFormat["Float32x4"] = "float32x4";
    VertexFormat["Uint32"] = "uint32";
    VertexFormat["Uint32x2"] = "uint32x2";
    VertexFormat["Uint32x3"] = "uint32x3";
    VertexFormat["Uint32x4"] = "uint32x4";
    VertexFormat["Sint32"] = "sint32";
    VertexFormat["Sint32x2"] = "sint32x2";
    VertexFormat["Sint32x3"] = "sint32x3";
    VertexFormat["Sint32x4"] = "sint32x4";
    VertexFormat["Unorm10_10_10_2"] = "unorm10-10-10-2";
    VertexFormat["Unorm8x4_bgra"] = "unorm8x4-bgra";
})(VertexFormat || (VertexFormat = {}));
/**
 * Lightweight Mesh representation containing vertex streams and an optional index buffer.
 * Use `MeshBuilder` to construct instances.
 */
class Mesh {
    /**
     * @internal
     */
    constructor(topology, frontFace, streams, indexBuffer) {
        this._streams = [];
        this._topology = topology;
        this._frontFace = frontFace;
        this._streams = streams;
        this._indexBuffer = indexBuffer;
        this._numVertices = this._streams[0].numVertices;
        this._streams.forEach(stream => console.assert(stream.numVertices === this._numVertices, "All vertex streams must have the same number of vertices."));
    }
    /** The primitive topology for this mesh. */
    get topology() {
        return this._topology;
    }
    /** The winding used to determine front-facing triangles. */
    get frontFace() {
        return this._frontFace;
    }
    /** The number of vertex streams in this mesh. */
    get numStreams() {
        return this._streams.length;
    }
    /** Get the number of vertices in the first vertex stream. */
    get numVertices() {
        return this._numVertices;
    }
    /** Get the GPU-backed vertex buffer for a given stream index. */
    getVertexBuffer(streamIndex) {
        return this._streams[streamIndex].buffer;
    }
    /** Get the stride (byte size) of a vertex in the requested stream. */
    getStreamStride(streamIndex) {
        return this._streams[streamIndex].stride;
    }
    /** Get the declared attributes for a vertex stream. */
    getStreamAttributes(streamIndex) {
        return this._streams[streamIndex].attributes;
    }
    /** Get the optional index buffer backing this mesh. */
    get indexBuffer() {
        return this._indexBuffer?.buffer;
    }
    /** Get the index format of the index buffer backing this mesh. */
    get indexFormat() {
        return this._indexBuffer?.format ?? IndexFormat.Uint16;
    }
    /** Get the number of indices in the index buffer backing this mesh. */
    get numIndices() {
        return this._indexBuffer?.count ?? 0;
    }
}
function vertexFormatByteSize(format) {
    switch (format) {
        case VertexFormat.Uint8:
        case VertexFormat.Sint8:
        case VertexFormat.Unorm8:
        case VertexFormat.Snorm8:
            return 1;
        case VertexFormat.Uint8x2:
        case VertexFormat.Sint8x2:
        case VertexFormat.Unorm8x2:
        case VertexFormat.Snorm8x2:
        case VertexFormat.Uint16:
        case VertexFormat.Sint16:
        case VertexFormat.Unorm16:
        case VertexFormat.Snorm16:
        case VertexFormat.Float16:
            return 2;
        case VertexFormat.Uint8x4:
        case VertexFormat.Sint8x4:
        case VertexFormat.Unorm8x4:
        case VertexFormat.Snorm8x4:
        case VertexFormat.Uint16x2:
        case VertexFormat.Sint16x2:
        case VertexFormat.Unorm16x2:
        case VertexFormat.Snorm16x2:
        case VertexFormat.Float16x2:
        case VertexFormat.Float32:
        case VertexFormat.Uint32:
        case VertexFormat.Sint32:
        case VertexFormat.Unorm10_10_10_2:
        case VertexFormat.Unorm8x4_bgra:
            return 4;
        case VertexFormat.Uint16x4:
        case VertexFormat.Sint16x4:
        case VertexFormat.Unorm16x4:
        case VertexFormat.Snorm16x4:
        case VertexFormat.Float16x4:
        case VertexFormat.Float32x2:
        case VertexFormat.Uint32x2:
        case VertexFormat.Sint32x2:
            return 8;
        case VertexFormat.Float32x3:
        case VertexFormat.Uint32x3:
        case VertexFormat.Sint32x3:
            return 12;
        case VertexFormat.Float32x4:
        case VertexFormat.Uint32x4:
        case VertexFormat.Sint32x4:
            return 16;
    }
}
class VertexStream {
    constructor() {
        this.stride = 0;
        this.attributes = [];
    }
    pushAttribute(name, format) {
        this.attributes.push({ name, format, offset: this.stride });
        this.stride += vertexFormatByteSize(format);
    }
    get numVertices() {
        return this.buffer.size / this.stride;
    }
}
/**
 * Builder helper used when creating a vertex stream for a Mesh.
 */
class StreamBuilder {
    /**
     * @internal
     */
    constructor(stream, ctx) {
        this._stream = stream;
        this._ctx = ctx;
    }
    /**
     * Add a vertex attribute to the stream.
     * @param name - attribute name used by the shader bindings
     * @param format - attribute format (see VertexFormat)
     */
    pushAttribute(name, format) {
        this._stream.pushAttribute(name, format);
        return this;
    }
    /**
     * Upload vertex data for this stream. `keepOnCPU` controls whether the
     * source ArrayBuffer is retained in memory for readback.
     */
    withData(data, keepOnCPU = false) {
        this._stream.buffer = new _buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferBuilder(this._ctx)
            .withData(data, keepOnCPU)
            .withUsage(_buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferUsage.Vertex | _buffers_Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferUsage.CopyDst)
            .build();
    }
}
/**
 * Fluent builder for creating a Mesh. Use `pushStream()` to describe vertex
 * streams and `withIndexData()` to add optional indices.
 */
class MeshBuilder {
    /**
     * @internal
     */
    constructor(ctx) {
        this._topology = MeshTopology.TriangleList;
        this._frontFace = FrontFace.CounterClockwise;
        this._streams = [];
        this._ctx = ctx;
    }
    /** Add a vertex stream using a builder callback. */
    pushStream(buildFunc) {
        const stream = new VertexStream();
        buildFunc(new StreamBuilder(stream, this._ctx));
        console.assert(stream.buffer !== undefined, "Vertex stream must have a buffer. Did you forget to call withData()?");
        this._streams.push(stream);
        return this;
    }
    /** Set the winding used to determine front-facing triangles. Defaults to counter-clockwise. */
    withFrontFace(value) {
        this._frontFace = value;
        return this;
    }
    /** Set the primitive topology for the mesh. Defaults to triangle list. */
    withTopology(value) {
        this._topology = value;
        return this;
    }
    /**
     * Provide index data (Uint16Array or Uint32Array). If `keepOnCPU` is true the
     * original array buffer will be preserved on the resulting mesh's index buffer.
     */
    withIndexData(data, keepOnCPU = false) {
        this._indexBuffer = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_1__.mapUndefined)(data, data => new IndexBuffer(data, this._ctx, keepOnCPU));
        return this;
    }
    /** Build the mesh. */
    build() {
        console.assert(this._streams.length > 0, "Mesh must have at least one vertex stream.");
        return new Mesh(this._topology, this._frontFace, this._streams, this._indexBuffer);
    }
}


/***/ }),

/***/ "./src/RenderPass.ts":
/*!***************************!*\
  !*** ./src/RenderPass.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderPass: () => (/* binding */ RenderPass),
/* harmony export */   RenderPassBuilder: () => (/* binding */ RenderPassBuilder)
/* harmony export */ });
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");


/**
 * Lightweight wrapper around GPURenderPassEncoder. Provides a minimal API
 * for ending the pass; higher-level helpers may be added later.
 */
class RenderPass {
    /**
     * Internal accessor for the underlying GPURenderPassEncoder. Not intended for public use.
     * @internal
     */
    constructor(inner) {
        this._numVertices = 0;
        this._numIndices = 0;
        this._inner = inner;
    }
    /**
     * Set the render pipeline to use for the next draw calls.
     * @param pipeline
     */
    setPipeline(pipeline) {
        if (this._renderPipeline != pipeline) {
            this._inner.setPipeline(pipeline._inner);
            this._renderPipeline = pipeline;
        }
        return this;
    }
    /**
     * Sets the mesh to use for the next draw calls.
     * @param mesh
     */
    setMesh(mesh) {
        for (let i = 0; i < mesh.numStreams; ++i) {
            const vertex_buffer = mesh.getVertexBuffer(i);
            this._inner.setVertexBuffer(i, vertex_buffer._inner);
        }
        this._numVertices = mesh.numVertices;
        const indexBuffer = mesh.indexBuffer;
        if (indexBuffer) {
            this._inner.setIndexBuffer(indexBuffer._inner, mesh.indexFormat);
            this._numIndices = mesh.numIndices;
        }
        else {
            this._numIndices = 0;
        }
        return this;
    }
    /**
     * Set a bind group at the given index.
     * @param index - bind group index in the render pipeline layout
     * @param bindGroup - a `BindGroup` instance
     */
    setBindGroup(index, bindGroup) {
        this._inner.setBindGroup(index, bindGroup._inner);
        return this;
    }
    /**
     * Issue a draw call using the currently set pipeline and mesh.
     */
    draw() {
        if (this._numIndices) {
            this._inner.drawIndexed(this._numIndices, 1, 0, 0, 0);
        }
        else {
            this._inner.draw(this._numVertices, 1, 0, 0);
        }
        return this;
    }
    /**
     * End the render pass. After calling end(), the underlying encoder may
     * continue recording other passes or be finished/submitted.
     */
    end() {
        this._inner.end();
    }
}
/**
 * Fluent builder for configuring and creating a render pass.
 *
 * Use the builder to specify color targets, clear values and labels before
 * calling `build()` to obtain a `RenderPass` instance.
 */
class RenderPassBuilder {
    /**
     * Create a new builder instance. This should only be called from the CommandEncoder
     * instance (see {@link CommandEncoder.createRenderPass}).
     * @internal
     */
    constructor(commandEncoder, globalBindGroups, defaultTarget, defaultDepthTarget) {
        this._colorTargets = [];
        this._clearColors = [];
        this._encoder = commandEncoder;
        this._defaultTarget = defaultTarget;
        this._defaultDepthTarget = defaultDepthTarget;
        this._globalBindGroups = globalBindGroups;
    }
    /**
     * Assign a human-readable label for the render pass (useful for GPU debuggers).
     */
    withLabel(label) {
        this._label = label;
        return this;
    }
    /**
     * Add a color target to render into. If no targets are added the default
     * backbuffer target will be used.
     */
    withColorTarget(target) {
        this._colorTargets.push(target);
        return this;
    }
    withDepthStencilTarget(target) {
        this._depthTarget = target;
        return this;
    }
    withClearColor(r, g, b, a) {
        let color;
        if (r === undefined) {
            color = [0.0, 0.0, 0.0, 1.0];
        }
        else if (typeof r === 'number') {
            color = [r, g ?? 0.0, b ?? 0.0, a ?? 1.0];
        }
        else {
            color = [r[0], r[1], r[2], r[3] ?? 1.0];
        }
        // rendering to the default target is special cased, so we need to set the clear color for the last target
        if (this._colorTargets.length === 0) {
            this._clearColors[0] = color;
        }
        else {
            this._clearColors[this._colorTargets.length - 1] = color;
        }
        return this;
    }
    /**
     * Set the clear stencil value
     */
    withClearStencil(stencil) {
        this._clearStencil = stencil;
        return this;
    }
    /**
     * Set the clear depth value
     */
    withClearDepth(depth) {
        this._clearDepth = depth;
        return this;
    }
    /**
     * Build and begin the render pass. Returns a `RenderPass` wrapper around
     * the low-level GPURenderPassEncoder.
     */
    build() {
        let targets;
        let depthTarget;
        // if anything was specified specifically, use those, otherwise use the defaults
        if (this._colorTargets.length || !!this._depthTarget) {
            targets = this._colorTargets;
            depthTarget = this._depthTarget;
        }
        else {
            targets = [this._defaultTarget];
            depthTarget = this._defaultDepthTarget;
        }
        let stencilLoadOp;
        let stencilStoreOp;
        let stencilClearValue;
        if (depthTarget?.format === _enums__WEBPACK_IMPORTED_MODULE_1__.TextureFormat.Depth32FloatStencil8 || depthTarget?.format === _enums__WEBPACK_IMPORTED_MODULE_1__.TextureFormat.Depth24PlusStencil8) {
            stencilLoadOp = this._clearStencil != undefined ? 'clear' : 'load';
            stencilStoreOp = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._clearStencil, () => 'store');
            stencilClearValue = this._clearStencil;
        }
        const colorAttachments = targets.map((target, i) => ({
            view: target._inner,
            loadOp: this._clearColors[i] ? 'clear' : 'load',
            storeOp: 'store',
            clearValue: this._clearColors[i]
        }));
        const desc = {
            colorAttachments,
            depthStencilAttachment: (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(depthTarget, target => ({
                view: target._inner,
                depthClearValue: this._clearDepth,
                depthLoadOp: this._clearDepth != undefined ? 'clear' : 'load',
                depthStoreOp: (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._clearDepth, () => 'store'),
                stencilClearValue,
                stencilLoadOp,
                stencilStoreOp
            })),
            label: this._label
        };
        const pass = new RenderPass(this._encoder.beginRenderPass(desc));
        this._globalBindGroups.forEach((group, i) => pass.setBindGroup(i, group));
        return pass;
    }
}


/***/ }),

/***/ "./src/RenderPipeline.ts":
/*!*******************************!*\
  !*** ./src/RenderPipeline.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderPipeline: () => (/* binding */ RenderPipeline),
/* harmony export */   RenderPipelineBuilder: () => (/* binding */ RenderPipelineBuilder)
/* harmony export */ });
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");


/**
 * Thin wrapper around GPURenderPipeline exposing a small helper for attribute
 * location lookup. The underlying pipeline and shader are available for advanced use.
 */
class RenderPipeline {
    constructor(inner, shader) {
        this._inner = inner;
        this._shader = shader;
    }
    /**
     * Helper to get the shader-declared attribute location for a named attribute.
     */
    getVertexAttributeLocation(name) {
        return this._shader.getVertexAttributeLocation(name);
    }
}
/**
 * Fluent builder for creating a GPURenderPipeline. Attach a `Shader` and
 * optionally a `Mesh` (to derive vertex buffer layouts) before calling `build()`.
 */
class RenderPipelineBuilder {
    constructor(ctx, defaultDepthFormat) {
        this._colorTargets = [];
        this._vertexEntry = undefined;
        this._fragmentEntry = undefined;
        this._label = undefined;
        this._overrideConstants = {};
        this._cullMode = _enums__WEBPACK_IMPORTED_MODULE_1__.CullMode.Back;
        this._mesh = undefined;
        this._ctx = ctx;
        this._defaultColorState = [{
                format: ctx.format,
                blend: undefined,
                writeMask: GPUColorWrite.ALL
            }];
        this._defaultDepthState = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(defaultDepthFormat, format => ({
            format,
            depthWriteEnabled: true,
            depthCompare: 'less',
        }));
    }
    /** Assign a human-readable label for the pipeline (useful in graphics debuggers). */
    withLabel(label) {
        this._label = label;
        return this;
    }
    /** Set face-culling mode. Default is `Back`. */
    withCullMode(value) {
        this._cullMode = value;
        return this;
    }
    /** Provide a Mesh to automatically derive vertex buffer layouts. */
    withMesh(mesh) {
        this._mesh = mesh;
        return this;
    }
    /** Attach a compiled Shader to the pipeline. */
    withShader(shader) {
        this._shader = shader;
        return this;
    }
    /** Select the shader entry point for the vertex stage. */
    withVertexShader(entry) {
        this._vertexEntry = entry;
        return this;
    }
    /** Select the shader entry point for the fragment stage. */
    withFragmentShader(entry) {
        this._fragmentEntry = entry;
        return this;
    }
    /** Add a color target with the given texture format. */
    withColorTarget(format) {
        this._colorTargets.push({
            format,
            blend: undefined,
            writeMask: GPUColorWrite.ALL
        });
        return this;
    }
    /**
     * Add a depth target with the given texture format.
     */
    withDepthTarget(format) {
        this._depthState = {
            format,
            ...this._defaultDepthState
        };
        return this;
    }
    /**
     * Set the depth compare function. Default is `less`.
     * @param compare
     */
    withDepthCompare(compare) {
        const target = this._depthState ?? this._defaultDepthState;
        if (!target) {
            console.warn("No depth target set. Setting depth compare function has no effect.");
        }
        else {
            target.depthCompare = compare;
        }
        return this;
    }
    /**
     * Enable or disable depth writes. Default is `true`.
     * @param enabled
     */
    withDepthWrite(enabled) {
        const target = this._depthState ?? this._defaultDepthState;
        if (!target) {
            console.warn("No depth target set. Setting depth write enabled has no effect.");
        }
        else {
            target.depthWriteEnabled = enabled;
        }
        return this;
    }
    /** Override a shader constant for specialization. */
    withOverrideConstant(id, value) {
        this._overrideConstants[id] = value;
        return this;
    }
    /** Set the blend mode for the last assigned (or default) color target. */
    withBlendMode(blendMode) {
        this.lastColorTarget.blend = blendMode._inner;
        return this;
    }
    /**
     * Build and create the `RenderPipeline`. Throws if required pieces (shader/vertices)
     * are missing.
     */
    build() {
        if (!this._shader) {
            throw new Error("Shader not specified. Use withShader() to set the shader to use.");
        }
        const shader = this._shader;
        if (this._vertexEntry === undefined) {
            throw new Error("Shader does not contain a vertex entry point. Use ShaderBuilder.withVertexShader() to set one.");
        }
        let colorTargets;
        let depthState;
        if (this._colorTargets.length || !!this._depthState) {
            colorTargets = this._colorTargets;
            depthState = this._depthState;
        }
        else {
            // only use defaults if no targets were set explicitly
            colorTargets = this._defaultColorState;
            depthState = this._defaultDepthState;
        }
        const primitive = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._mesh, mesh => ({
            topology: mesh.topology,
            frontFace: mesh.frontFace,
            cullMode: this._cullMode,
        }));
        const buffers = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._mesh, mesh => {
            const buffers = [];
            for (let i = 0; i < mesh.numStreams; ++i) {
                const attributes = mesh.getStreamAttributes(i)
                    .filter(attr => shader.hasVertexAttribute(attr.name))
                    .map(attr => ({
                    shaderLocation: shader.getVertexAttributeLocation(attr.name),
                    offset: attr.offset,
                    format: attr.format,
                }));
                buffers.push({
                    arrayStride: mesh.getStreamStride(i),
                    stepMode: 'vertex',
                    attributes
                });
            }
            return buffers;
        });
        const layout = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(shader._bindGroupLayouts, bindGroupLayouts => this._ctx.device.createPipelineLayout({
            bindGroupLayouts: bindGroupLayouts.map(value => value._inner),
            label: this._label
        })) ?? "auto";
        const desc = {
            label: this._label,
            layout,
            primitive,
            depthStencil: depthState,
            vertex: {
                buffers,
                module: shader._inner,
                entryPoint: this._vertexEntry,
                constants: this._overrideConstants
            },
            fragment: (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._fragmentEntry, entry => ({
                module: shader._inner,
                entryPoint: entry,
                targets: colorTargets,
                constants: this._overrideConstants
            }))
        };
        const inner = this._ctx.device.createRenderPipeline(desc);
        return new RenderPipeline(inner, shader);
    }
    get lastColorTarget() {
        return this._colorTargets.length ? this._colorTargets[this._colorTargets.length - 1] : this._defaultColorState[0];
    }
}


/***/ }),

/***/ "./src/RenderTarget.ts":
/*!*****************************!*\
  !*** ./src/RenderTarget.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderTarget: () => (/* binding */ RenderTarget),
/* harmony export */   RenderTargetBuilder: () => (/* binding */ RenderTargetBuilder)
/* harmony export */ });
/**
 * Lightweight wrapper around a GPUTextureView representing a render target.
 * Use `view()` to get the underlying GPUTextureView when building render passes.
 */
class RenderTarget {
    constructor(view, format) {
        this._inner = view;
        this._format = format;
    }
    get format() {
        return this._format;
    }
}
/**
 * Builder for creating a `RenderTarget` from a `Texture`.
 *
 * The builder produces a GPUTextureView configured with a sensible default
 * descriptor and wraps it in a `RenderTarget` helper.
 */
class RenderTargetBuilder {
    /**
     * Create a new RenderTargetBuilder for the given texture. This should only be called
     * from the TinyHelix instance (see {@link TinyHelix.createRenderTarget}).
     * @param texture
     *
     * @internal
     */
    constructor(texture) {
        this._baseMipLevel = 0;
        this._baseArrayLayer = 0;
        this._texture = texture;
    }
    /**
     * Set the base mip level to use for the render target. Defaults to 0.
     */
    withMipLevel(level) {
        this._baseMipLevel = level;
        return this;
    }
    /**
     * Set the base array layer to use for the render target. Defaults to 0.
     */
    withArrayLayer(layer) {
        this._baseArrayLayer = layer;
        return this;
    }
    /**
     * Create and return a new `RenderTarget` instance.
     */
    build() {
        const tex = this._texture._inner;
        const desc = {
            format: tex.format,
            dimension: tex.dimension,
            aspect: 'all',
            baseMipLevel: this._baseMipLevel,
            mipLevelCount: 1,
            baseArrayLayer: this._baseArrayLayer,
            arrayLayerCount: 1
        };
        return new RenderTarget(this._texture._inner.createView(desc), this._texture.format);
    }
}


/***/ }),

/***/ "./src/Sampler.ts":
/*!************************!*\
  !*** ./src/Sampler.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sampler: () => (/* binding */ Sampler),
/* harmony export */   SamplerBuilder: () => (/* binding */ SamplerBuilder)
/* harmony export */ });
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");

class Sampler {
    constructor(inner) {
        this._inner = inner;
    }
}
class SamplerBuilder {
    constructor(ctx) {
        this._ctx = ctx;
    }
    withAddressMode(u, v, w) {
        this._addressModeU = u;
        this._addressModeV = v ?? u;
        this._addressModeW = w ?? u;
        return this;
    }
    withFiltering(minFilter, magFilter, mipmapFilter) {
        this._minFilter = minFilter;
        this._magFilter = magFilter ?? minFilter;
        this._mipmapFilter = mipmapFilter ?? minFilter;
        return this;
    }
    withTrilinearFiltering() {
        this.withFiltering(_enums__WEBPACK_IMPORTED_MODULE_0__.FilterMode.Linear);
        return this;
    }
    withNearestFiltering() {
        this.withFiltering(_enums__WEBPACK_IMPORTED_MODULE_0__.FilterMode.Nearest);
        return this;
    }
    withAnisotropicFiltering(maxAnisotropy) {
        this.withFiltering(_enums__WEBPACK_IMPORTED_MODULE_0__.FilterMode.Linear);
        this._maxAnisotropy = maxAnisotropy;
        return this;
    }
    withMinMipLevel(level) {
        this._minMipLevel = level;
        return this;
    }
    withMaxMipLevel(level) {
        this._maxMipLevel = level;
        return this;
    }
    withCompareFunction(compare) {
        this._compare = compare;
        return this;
    }
    build() {
        return new Sampler(this._ctx.device.createSampler({
            addressModeU: this._addressModeU,
            addressModeV: this._addressModeV,
            addressModeW: this._addressModeW,
            magFilter: this._magFilter,
            minFilter: this._minFilter,
            mipmapFilter: this._mipmapFilter,
            lodMinClamp: this._minMipLevel,
            lodMaxClamp: this._maxMipLevel,
            compare: this._compare,
            maxAnisotropy: this._maxAnisotropy
        }));
    }
}


/***/ }),

/***/ "./src/Shader.ts":
/*!***********************!*\
  !*** ./src/Shader.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Shader: () => (/* binding */ Shader),
/* harmony export */   ShaderBuilder: () => (/* binding */ ShaderBuilder)
/* harmony export */ });
/* harmony import */ var _BindGroup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BindGroup */ "./src/BindGroup.ts");

/**
 * Wrapper around GPUShaderModule. Keeps a map of vertex attribute names to
 * shader locations to aid pipeline construction.
 */
class Shader {
    /**
     * @internal
     */
    constructor(inner, ctx, vertexAttributes, bindGroupLayouts) {
        this._inner = inner;
        this._ctx = ctx;
        this._vertexAttributes = vertexAttributes;
        this._bindGroupLayouts = bindGroupLayouts;
    }
    /**
     * Get the shader location for a named vertex attribute. Returns undefined if the attribute
     * is not declared by the shader.
     */
    getVertexAttributeLocation(name) {
        return this._vertexAttributes.get(name) ?? undefined;
    }
    /**
     * Returns true if the shader declares a vertex attribute with the given name.
     * @param name
     */
    hasVertexAttribute(name) {
        return this._vertexAttributes.has(name);
    }
    /**
     * Create a BindGroupBuilder for the shader's bind group at the given index.
     * @param group - index of the bind group declared by the shader
     */
    createBindGroup(group) {
        return new _BindGroup__WEBPACK_IMPORTED_MODULE_0__.BindGroupBuilder(this._ctx, this._bindGroupLayouts[group]);
    }
}
/**
 * Builder for creating shader modules and declaring attribute locations used by the helper
 * pipeline builder.
 */
class ShaderBuilder {
    /**
     * @internal
     */
    constructor(ctx) {
        this._vertexAttributes = new Map(); // name -> location
        this._includes = new Map();
        this._ctx = ctx;
    }
    /** Optional label for the underlying GPUShaderModule. */
    withLabel(label) {
        this._label = label;
        return this;
    }
    /** Set WGSL or other shader code to compile into a GPUShaderModule. */
    withCode(code) {
        this._code = code;
        return this;
    }
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
    withInclude(name, code) {
        this._includes.set(name, code);
        return this;
    }
    /** Declare a named vertex attribute and the location it maps to in the shader. */
    withVertexAttribute(name, location) {
        this._vertexAttributes.set(name, location);
        return this;
    }
    withBindGroup(index, layout) {
        this._bindGroupLayouts = this._bindGroupLayouts ?? [];
        if (layout instanceof _BindGroup__WEBPACK_IMPORTED_MODULE_0__.BindGroupLayout) {
            this._bindGroupLayouts[index] = layout;
        }
        else {
            const builder = new _BindGroup__WEBPACK_IMPORTED_MODULE_0__["default"](this._ctx);
            layout(builder);
            this._bindGroupLayouts[index] = builder.build();
        }
        return this;
    }
    // TODO: Provide layout methods
    /** Compile the shader module and return a `Shader` instance. */
    build() {
        if (!this._code) {
            throw new Error("Shader code not specified. Use withCode() to set the shader source.");
        }
        let code = this._code;
        for (const [name, inc] of this._includes) {
            // Create a regex to match the include directive while allowing
            // optional whitespace between tokens, e.g.:
            //   #include<name>
            //   # include < name >
            // and so on. Escape the include name so it is safe in a RegExp.
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const includeRegex = new RegExp(`#\\s*include\\s*<\\s*${escapedName}\\s*>`, 'g');
            code = code.replace(includeRegex, inc);
        }
        const inner = this._ctx.device.createShaderModule({
            label: this._label,
            code,
        });
        return new Shader(inner, this._ctx, this._vertexAttributes, this._bindGroupLayouts);
    }
}


/***/ }),

/***/ "./src/Texture.ts":
/*!************************!*\
  !*** ./src/Texture.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Texture: () => (/* binding */ Texture),
/* harmony export */   TextureBuilder: () => (/* binding */ TextureBuilder),
/* harmony export */   TextureView: () => (/* binding */ TextureView),
/* harmony export */   TextureViewBuilder: () => (/* binding */ TextureViewBuilder)
/* harmony export */ });
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");

/**
 * Small wrapper around GPUTexture providing convenience constructors and
 * an internal accessor for low-level interop.
 */
class Texture {
    /**
     * Create a Texture wrapper from an existing GPUTexture.
     * @param texture - The underlying GPUTexture
     */
    static from_webgpu(texture, format) {
        return new Texture(texture, format);
    }
    constructor(inner, format) {
        this._inner = inner;
        this._format = format;
    }
    createView() {
        return new TextureViewBuilder(this);
    }
    get format() {
        return this._format;
    }
    _getBufferResource() {
        return this._inner.createView();
    }
}
class TextureBuilder {
    constructor(ctx) {
        this._size = [1, 1, 1];
        this._data = undefined;
        this._format = _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8UnormSrgb;
        this._usage = GPUTextureUsage.TEXTURE_BINDING;
        this._ctx = ctx;
    }
    withSize(width, height, depthOrArrayLayers = 1) {
        this._size = [width, height, depthOrArrayLayers];
        return this;
    }
    withData(data) {
        this._data = data;
        return this;
    }
    withFormat(format) {
        this._format = format;
        return this;
    }
    withImage(data) {
        this._data = data;
        this._size = [data.width, data.height, 1];
        return this;
    }
    withUsage(usage) {
        this._usage |= usage;
        return this;
    }
    build() {
        if (this._data) {
            this._usage |= GPUTextureUsage.COPY_DST;
        }
        const inner = this._ctx.device.createTexture({
            format: this._format, size: this._size, usage: this._usage
        });
        if (this._data instanceof ImageBitmap) {
            this._ctx.device.queue.copyExternalImageToTexture({ source: this._data }, { texture: inner }, [this._size[0], this._size[1], 1]);
        }
        else if (this._data) {
            const [width, height, depthOrArrayLayers] = this._size;
            const blockWidth = getBlockWidth(this._format);
            const blocksPerRow = Math.ceil(width / blockWidth);
            const bytesPerRow = blocksPerRow * bytesPerBlock(this._format);
            this._ctx.device.queue.writeTexture({ texture: inner }, this._data, { bytesPerRow }, { width, height, depthOrArrayLayers });
        }
        return new Texture(inner, this._format);
    }
}
class TextureView {
    constructor(inner) {
        this._inner = inner;
    }
}
class TextureViewBuilder {
    /**
     * @internal
     */
    constructor(texture) {
        this._desc = {};
        this._texture = texture;
    }
    withSingleMip(level) {
        this._desc.baseMipLevel = level;
        this._desc.mipLevelCount = 1;
        return this;
    }
    withMipRange(start, end) {
        this._desc.baseMipLevel = start;
        this._desc.mipLevelCount = end - start;
        return this;
    }
    withSingleLayer(layer) {
        this._desc.baseArrayLayer = layer;
        this._desc.arrayLayerCount = 1;
        return this;
    }
    withLayerRange(start, end) {
        this._desc.baseArrayLayer = start;
        this._desc.arrayLayerCount = end;
        return this;
    }
    build() {
        return new TextureView(this._texture._inner.createView(this._desc));
    }
}
function isBc(format) {
    switch (format) {
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc1RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc1RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc2RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc2RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc3RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc3RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc4RUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc4RSnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc5RgUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc5RgSnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc6hRgbUfloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc6hRgbFloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc7RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc7RgbaUnormSrgb:
            return true;
        default: return false;
    }
}
function isEtc(format) {
    switch (format) {
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8A1Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8A1UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgba8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgba8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacR11Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacR11Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacRg11Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacRg11Snorm:
            return true;
        default:
            return false;
    }
}
function getBlockWidth(format) {
    if (isBc(format) || isEtc(format))
        return 4;
    switch (format) {
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc4x4Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc4x4UnormSrgb:
            return 4;
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x4Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x4UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x5UnormSrgb:
            return 5;
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x6UnormSrgb:
            return 6;
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x6UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x8UnormSrgb:
            return 8;
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x6UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x10Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x10UnormSrgb:
            return 10;
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x10Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x10UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x12Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x12UnormSrgb:
            return 12;
        default:
            return 1;
    }
}
/**
 * Returns the number of bytes in a compressed or uncompressed block for the
 * given texture format. Matches the mapping from the Rust implementation and
 * throws for unsupported formats.
 */
function bytesPerBlock(format) {
    switch (format) {
        // 1-byte formats
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R8Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R8Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R8Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Stencil8:
            return 1;
        // 2-byte formats
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R16Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R16Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R16Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R16Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R16Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG8Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG8Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG8Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Depth16Unorm:
            return 2;
        // 4-byte formats
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R32Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R32Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.R32Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG16Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG16Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG16Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG16Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG16Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bgra8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bgra8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgb9e5Ufloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgb10a2Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgb10a2Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Depth24Plus:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Depth24PlusStencil8:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Depth32Float:
            return 4;
        // 8-byte formats
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rg11b10Ufloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG32Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG32Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.RG32Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba16Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba16Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba16Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba16Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba16Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Depth32FloatStencil8:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc1RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc1RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc4RUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc4RSnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8A1Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgb8A1UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacR11Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacR11Snorm:
            return 8;
        // 16-byte formats
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba32Uint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba32Sint:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba32Float:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc2RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc2RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc3RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc3RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc5RgUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc5RgSnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc6hRgbUfloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc6hRgbFloat:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc7RgbaUnorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc7RgbaUnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgba8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Etc2Rgba8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacRg11Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.EacRg11Snorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc4x4Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc4x4UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x4Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x4UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc5x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc6x6UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x6UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc8x8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x5Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x5UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x6Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x6UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x8Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x8UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x10Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc10x10UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x10Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x10UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x12Unorm:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Astc12x12UnormSrgb:
        case _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Bc2RgbaUnorm:
            // NOTE: Bc2RgbaUnorm is already listed above; duplicate entries are
            // harmless but kept out of caution when mapping from Rust.
            return 16;
        default:
            throw new Error(`Unsupported texture format: ${format}`);
    }
}


/***/ }),

/***/ "./src/TinyHelix.ts":
/*!**************************!*\
  !*** ./src/TinyHelix.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TinyHelix: () => (/* binding */ TinyHelix)
/* harmony export */ });
/* harmony import */ var _WebGPUContext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WebGPUContext */ "./src/WebGPUContext.ts");
/* harmony import */ var _CommandEncoder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CommandEncoder */ "./src/CommandEncoder.ts");
/* harmony import */ var _Texture__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Texture */ "./src/Texture.ts");
/* harmony import */ var _RenderTarget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./RenderTarget */ "./src/RenderTarget.ts");
/* harmony import */ var _Shader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Shader */ "./src/Shader.ts");
/* harmony import */ var _RenderPipeline__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./RenderPipeline */ "./src/RenderPipeline.ts");
/* harmony import */ var _Mesh__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Mesh */ "./src/Mesh.ts");
/* harmony import */ var _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./buffers/UniformBuffer */ "./src/buffers/UniformBuffer.ts");
/* harmony import */ var _BindGroup__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./BindGroup */ "./src/BindGroup.ts");
/* harmony import */ var _Sampler__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Sampler */ "./src/Sampler.ts");
/* harmony import */ var _ComputePipeline__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ComputePipeline */ "./src/ComputePipeline.ts");
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utils/mapUndefined */ "./src/utils/mapUndefined.ts");
/* harmony import */ var _buffers_Buffer__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./buffers/Buffer */ "./src/buffers/Buffer.ts");













/**
 * Main entry point for the tiny-helix API. Manages the WebGPU context,
 * backbuffer and provides helpers to create render targets and command encoders.
 */
class TinyHelix {
    /**
     * Create a new TinyHelix instance. Call `initialize()` before rendering.
     */
    constructor(canvas) {
        this._options = {};
        this._shaderIncludes = new Map();
        this._globalBindBufferLayouts = [];
        this._globalBindBuffers = [];
        this._context = new _WebGPUContext__WEBPACK_IMPORTED_MODULE_0__.WebGPUContext();
        this._canvas = canvas;
    }
    /**
     * Initializes the underlying WebGPU context and prepares resources.
     * @param options - Configuration options forwarded to the WebGPU context
     * @example await tiny.initialize({ canvas: myCanvas });
     */
    async initialize(options = {}) {
        options.canvas = this._canvas;
        this._options = options;
        await this._context.initialize(options);
        this._createDepthStencil();
    }
    resize(width, height) {
        this._canvas.width = width;
        this._canvas.height = height;
        this._createDepthStencil();
    }
    /**
     * Add a named include for all shader code. The include will be expanded
     * in any shader code created through {@link TinyHelix.createShader}.
     * The include name must be unique within the shader code. This allows
     * using `#include<name>` in the shader code to include other files.
     * While this is not standard WGSL, it's too useful not to support.
     '
     * @param name - The name as used in the `#include<name>` directive.
     * @param source - The code the include should expand to.
     */
    addShaderInclude(name, source) {
        this._shaderIncludes.set(name, source);
        return this;
    }
    /**
     * Return the chosen depth/stencil format if configured.
     */
    get depthStencilFormat() {
        return this._options.depthStencilFormat;
    }
    /**
     * The current frame's backbuffer texture. Valid after `startFrame()` has been
     * called.
     * @throws Error if accessed before startFrame()
     */
    get backbuffer() {
        if (!this._backbuffer) {
            throw new Error('Backbuffer not initialized. Did you forget to call startFrame()?');
        }
        return this._backbuffer;
    }
    /**
     * The RenderTarget wrapper for the current backbuffer. Valid after `startFrame()`.
     * @throws Error if accessed before startFrame()
     */
    get backbufferTarget() {
        if (!this._backbufferTarget) {
            throw new Error('Backbuffer not initialized. Did you forget to call startFrame()?');
        }
        return this._backbufferTarget;
    }
    get colorSpace() {
        return this._context.colorSpace;
    }
    get backbufferFormat() {
        return this._context.format;
    }
    /**
     * The width of the current backbuffer. Valid after `startFrame()`.
     */
    get backbufferWidth() {
        return this._canvas.width;
    }
    /**
     * The height of the current backbuffer. Valid after `startFrame()`.
     */
    get backbufferHeight() {
        return this._canvas.height;
    }
    /**
     * Needs to be called before rendering each frame. Updates internal backbuffer
     * references to the current swapchain texture.
     * @example tiny.startFrame();
     */
    startFrame() {
        this._backbuffer = _Texture__WEBPACK_IMPORTED_MODULE_2__.Texture.from_webgpu(this._context.getCurrentTexture(), this._context.format);
        this._backbufferTarget = this.createRenderTarget(this._backbuffer)
            .build();
    }
    /**
     * Create a RenderTargetBuilder for a given texture.
     */
    createRenderTarget(target) {
        return new _RenderTarget__WEBPACK_IMPORTED_MODULE_3__.RenderTargetBuilder(target);
    }
    /**
     * Create a ShaderBuilder for creating a Shader.
     */
    createShader() {
        let builder = new _Shader__WEBPACK_IMPORTED_MODULE_4__.ShaderBuilder(this._context);
        this._shaderIncludes.forEach((v, k) => builder = builder.withInclude(k, v));
        this._globalBindBufferLayouts.forEach((layout, i) => builder.withBindGroup(i, layout));
        return builder;
    }
    /**
     * Create a BindGroupLayoutBuilder for creating a BindGroupLayout.
     */
    createBindGroupLayout() {
        return new _BindGroup__WEBPACK_IMPORTED_MODULE_8__["default"](this._context);
    }
    /**
     * Create a BindGroupBuilder for creating a BindGroup.
     */
    createBindGroup(layout) {
        return new _BindGroup__WEBPACK_IMPORTED_MODULE_8__.BindGroupBuilder(this._context, layout);
    }
    /**
     * Create a MeshBuilder for creating a Mesh.
     */
    createMesh() {
        return new _Mesh__WEBPACK_IMPORTED_MODULE_6__.MeshBuilder(this._context);
    }
    /**
     * Create a RenderPipelineBuilder for creating a RenderPipeline.
     */
    createRenderPipeline() {
        return new _RenderPipeline__WEBPACK_IMPORTED_MODULE_5__.RenderPipelineBuilder(this._context, this._options.depthStencilFormat);
    }
    /**
     * Create a ComputePipelineBuilder for creating a ComputePipeline.
     */
    createComputePipeline() {
        return new _ComputePipeline__WEBPACK_IMPORTED_MODULE_10__.ComputePipelineBuilder(this._context);
    }
    /**
     * Create a SamplerBuilder for creating a Sampler.
     */
    createSampler() {
        return new _Sampler__WEBPACK_IMPORTED_MODULE_9__.SamplerBuilder(this._context);
    }
    /**
     * Create a TextureBuilder for creating a Texture.
     */
    createTexture() {
        return new _Texture__WEBPACK_IMPORTED_MODULE_2__.TextureBuilder(this._context);
    }
    /**
     * Creates a command encoder for recording GPU commands for the current frame.
     * @param label - Optional debug label to assign to the encoder
     */
    createCommandEncoder(label) {
        return new _CommandEncoder__WEBPACK_IMPORTED_MODULE_1__.CommandEncoder(this.backbufferTarget, this._globalBindBuffers, this._context, this._depthStencilTarget, label);
    }
    /**
     * Create a UniformBufferLayoutBuilder for creating a UniformBufferLayout.
     */
    createUniformBufferLayout() {
        return new _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_7__.UniformBufferLayoutBuilder();
    }
    /**
     * Create a UniformBuffer for the given layout.
     */
    createUniformBuffer(layout) {
        return new _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_7__.UniformBuffer(layout, this._context);
    }
    /**
     * Create a BufferBuilder to construct raw buffers.
     */
    createBuffer() {
        return new _buffers_Buffer__WEBPACK_IMPORTED_MODULE_12__.BufferBuilder(this._context);
    }
    /**
     * Allows setting a global bind group for all render passes. This is useful
     * for setting bind groups that are used by all passes. These buffers will
     * automatically be set for all render and compute passes.
     * @param index - The index of the bind group in the render pipeline layout.
     * @param buffer - The bind group to set.
     */
    setGlobalBindGroup(index, layout, buffer) {
        this._globalBindBufferLayouts[index] = layout;
        this._globalBindBuffers[index] = buffer;
        return this;
    }
    /**
     * Destroy the TinyHelix instance and release all GPU resources.
     */
    destroy() {
        this._context.destroy();
    }
    /**
     * Returns the current depth/stencil texture if configured.
     */
    depthStencilTexture() {
        return this._depthStencil;
    }
    /**
     * Returns the current depth/stencil RenderTarget if configured.
     */
    depthStencilTarget() {
        return this._depthStencilTarget;
    }
    _createDepthStencil() {
        this._depthStencil = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_11__.mapUndefined)(this._options.depthStencilFormat, (f) => this.createTexture()
            .withFormat(f)
            .withSize(this._canvas.width, this._canvas.height)
            .withUsage(GPUTextureUsage.RENDER_ATTACHMENT)
            .build());
        this._depthStencilTarget = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_11__.mapUndefined)(this._depthStencil, (t) => this.createRenderTarget(t)
            .build());
    }
}


/***/ }),

/***/ "./src/WebGPUContext.ts":
/*!******************************!*\
  !*** ./src/WebGPUContext.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebGPUContext: () => (/* binding */ WebGPUContext)
/* harmony export */ });
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");

/**
 * Manages WebGPU adapter, device, and context initialization
 */
class WebGPUContext {
    constructor() {
        this._adapter = null;
        this._device = null;
        this._context = null;
        this._format = _enums__WEBPACK_IMPORTED_MODULE_0__.TextureFormat.Rgba8UnormSrgb;
        this._canvas = null;
        this._colorSpace = _enums__WEBPACK_IMPORTED_MODULE_0__.ColorSpace.sRGB;
    }
    /**
     * Gets the WebGPU adapter. Throws if not initialized.
     */
    get adapter() {
        return this._adapter;
    }
    /**
     * Gets the WebGPU device. Throws if not initialized.
     */
    get device() {
        return this._device;
    }
    /**
     * Gets the GPU canvas context. Throws if no canvas was configured.
     */
    get context() {
        return this._context;
    }
    /**
     * Gets the preferred texture format used by the configured canvas/context.
     */
    get format() {
        return this._format;
    }
    /**
     * Gets the color space used by the configured canvas/context.
     */
    get colorSpace() {
        return this._colorSpace;
    }
    /**
     * Gets the configured canvas element. Throws if none was provided during initialization.
     */
    get canvas() {
        return this._canvas;
    }
    /**
     * Checks if WebGPU is supported in the current environment.
     */
    static isSupported() {
        return typeof navigator !== 'undefined' && 'gpu' in navigator;
    }
    /**
     * Initializes the WebGPU context and device.
     * @param options - Configuration options such as canvas and adapter preferences
     * @throws Error if WebGPU is not supported or initialization fails
     */
    async initialize(options = {}) {
        if (!WebGPUContext.isSupported()) {
            throw new Error('WebGPU is not supported in this browser');
        }
        // Request adapter
        this._adapter = await navigator.gpu.requestAdapter({
            powerPreference: options.powerPreference ?? 'high-performance',
        });
        if (!this._adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }
        // Request device
        this._device = await this._adapter.requestDevice({
            requiredFeatures: options.requiredFeatures,
            requiredLimits: options.requiredLimits,
        });
        if (!this._device) {
            throw new Error('Failed to get WebGPU device');
        }
        // Setup error handling
        this._device.lost.then((info) => {
            console.error('WebGPU device lost:', info.message);
            if (info.reason !== 'destroyed') {
                // Attempt to reinitialize
                this.initialize(options).catch((error) => {
                    console.error('Failed to reinitialize WebGPU context:', error);
                });
            }
        });
        // Configure canvas context if provided
        if (options.canvas) {
            this._canvas = options.canvas;
            this._context = this._canvas.getContext('webgpu');
            console.log(this._context);
            if (!this._context) {
                throw new Error('Failed to get WebGPU context from canvas');
            }
            const canUseP3 = window.matchMedia("(color-gamut: p3)").matches;
            this._colorSpace = options.colorSpace ?? _enums__WEBPACK_IMPORTED_MODULE_0__.ColorSpace.sRGB;
            if (this._colorSpace === _enums__WEBPACK_IMPORTED_MODULE_0__.ColorSpace.DisplayP3 && !canUseP3) {
                this._colorSpace = _enums__WEBPACK_IMPORTED_MODULE_0__.ColorSpace.sRGB;
                console.warn("DisplayP3 not supported, falling back to sRGB");
            }
            this._format = navigator.gpu.getPreferredCanvasFormat();
            this._context.configure({
                device: this._device,
                format: this._format,
                colorSpace: this._colorSpace,
                alphaMode: 'premultiplied',
            });
        }
        else {
            console.warn("No canvas provided!");
        }
    }
    /**
     * Internal helper to fetch the current swapchain texture.
     * @internal
     */
    getCurrentTexture() {
        return this._context.getCurrentTexture();
    }
    /**
     * Destroys the WebGPU context and releases resources
     */
    destroy() {
        if (this._device) {
            this._device.destroy();
            this._device = null;
        }
        this._adapter = null;
        this._context = null;
        this._canvas = null;
    }
}


/***/ }),

/***/ "./src/buffers/Buffer.ts":
/*!*******************************!*\
  !*** ./src/buffers/Buffer.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Buffer: () => (/* binding */ Buffer),
/* harmony export */   BufferBuilder: () => (/* binding */ BufferBuilder),
/* harmony export */   BufferUsage: () => (/* binding */ BufferUsage),
/* harmony export */   TextureUsage: () => (/* binding */ TextureUsage)
/* harmony export */ });
/* harmony import */ var _utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mapUndefined */ "./src/utils/mapUndefined.ts");
/* harmony import */ var _utils_padArrayBuffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/padArrayBuffer */ "./src/utils/padArrayBuffer.ts");


/**
 * Buffer usage flags re-exported from the WebGPU API for convenience.
 * Use these when constructing buffers with `BufferBuilder.withUsage()`.
 */
var BufferUsage;
(function (BufferUsage) {
    BufferUsage[BufferUsage["MapRead"] = GPUBufferUsage.MAP_READ] = "MapRead";
    BufferUsage[BufferUsage["MapWrite"] = GPUBufferUsage.MAP_WRITE] = "MapWrite";
    BufferUsage[BufferUsage["CopySrc"] = GPUBufferUsage.COPY_SRC] = "CopySrc";
    BufferUsage[BufferUsage["CopyDst"] = GPUBufferUsage.COPY_DST] = "CopyDst";
    BufferUsage[BufferUsage["Index"] = GPUBufferUsage.INDEX] = "Index";
    BufferUsage[BufferUsage["Vertex"] = GPUBufferUsage.VERTEX] = "Vertex";
    BufferUsage[BufferUsage["Uniform"] = GPUBufferUsage.UNIFORM] = "Uniform";
    BufferUsage[BufferUsage["Storage"] = GPUBufferUsage.STORAGE] = "Storage";
    BufferUsage[BufferUsage["Indirect"] = GPUBufferUsage.INDIRECT] = "Indirect";
    BufferUsage[BufferUsage["QueryResolve"] = GPUBufferUsage.QUERY_RESOLVE] = "QueryResolve";
})(BufferUsage || (BufferUsage = {}));
var TextureUsage;
(function (TextureUsage) {
    TextureUsage[TextureUsage["CopySrc"] = GPUTextureUsage.COPY_SRC] = "CopySrc";
    TextureUsage[TextureUsage["CopyDst"] = GPUTextureUsage.COPY_DST] = "CopyDst";
    TextureUsage[TextureUsage["TextureBinding"] = GPUTextureUsage.TEXTURE_BINDING] = "TextureBinding";
    TextureUsage[TextureUsage["StorageBinding"] = GPUTextureUsage.STORAGE_BINDING] = "StorageBinding";
    TextureUsage[TextureUsage["RenderAttachment"] = GPUTextureUsage.RENDER_ATTACHMENT] = "RenderAttachment";
})(TextureUsage || (TextureUsage = {}));
/**
 * Builder for creating GPU-backed buffers.
 *
 * Example:
 * const buf = new BufferBuilder(ctx)
 *   .withUsage(BufferUsage.Vertex | BufferUsage.CopyDst)
 *   .withData(new Float32Array([...]).buffer)
 *   .build();
 */
class BufferBuilder {
    constructor(ctx) {
        this._size = 0;
        this._keepData = false;
        this._usage = 0;
        this._ctx = ctx;
    }
    /**
     * Add usage flags for the GPU buffer.
     */
    withUsage(usage) {
        this._usage |= usage;
        return this;
    }
    /**
     * Provide initial data for the buffer. If `keepOnCPU` is true the original
     * ArrayBuffer is stored in the resulting `Buffer.data` field for readback or
     * reuse.
     */
    withData(data, keepOnCPU = false) {
        this._data = data;
        // round to the nearest multiple of 4 bytes, as required by GPUBuffer.writeBuffer()
        this._size = data.byteLength;
        this._keepData = keepOnCPU;
        this._usage |= BufferUsage.CopyDst;
        return this;
    }
    /**
     * Specify a size for the buffer, used when not providing data.
     */
    withSize(size) {
        this._size = size;
        return this;
    }
    /**
     * Create the GPU buffer and upload any provided data.
     */
    build() {
        const data = (0,_utils_mapUndefined__WEBPACK_IMPORTED_MODULE_0__.mapUndefined)(this._data, data => (0,_utils_padArrayBuffer__WEBPACK_IMPORTED_MODULE_1__.padArrayBuffer)(data, 4));
        const buffer = this._ctx.device.createBuffer({
            size: data ? data.byteLength : this._size, // in case we don't have data, we need to specify the size explicitly'
            usage: this._usage
        });
        if (data) {
            this._ctx.device.queue.writeBuffer(buffer, 0, data);
        }
        return new Buffer(buffer, this._keepData ? this._data : undefined);
    }
}
/**
 * Lightweight wrapper around a GPUBuffer. Exposes the original CPU-side data
 * (when kept) and the underlying GPU buffer for low-level interop.
 */
class Buffer {
    /**
     * Create a Buffer from an existing GPUBuffer.
     * @param inner The underlying GPUBuffer.
     * @param data Optional CPU-side copy of the buffer contents.
     */
    constructor(inner, data) {
        this._inner = inner;
        this.data = data;
    }
    /** Size of the GPU buffer in bytes. */
    get size() { return this._inner.size; }
    _uploadData(ctx) {
        if (!this.data) {
            console.warn("Buffer has no data to upload.");
            return;
        }
        ctx.device.queue.writeBuffer(this._inner, 0, this.data);
    }
    _getBufferResource() {
        return { buffer: this._inner };
    }
}


/***/ }),

/***/ "./src/buffers/BufferDataWriter.ts":
/*!*****************************************!*\
  !*** ./src/buffers/BufferDataWriter.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BufferDataWriter: () => (/* binding */ BufferDataWriter)
/* harmony export */ });
/* harmony import */ var _utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/float32ToFloat16 */ "./src/utils/float32ToFloat16.ts");

/**
 * Utility for incrementally building binary data into an ArrayBuffer.
 * Provides typed push helpers for common numeric types used in vertex/index buffers.
 */
class BufferDataWriter {
    /** Create a new writer with the given total byte size. */
    constructor(byteSize) {
        this._offset = 0;
        this._buffer = new ArrayBuffer(byteSize);
        this._view = new DataView(this._buffer);
    }
    /** Push an unsigned 8-bit integer. */
    pushUint8(value) {
        this._view.setUint8(this._offset, value);
        this._offset += 1;
        return this;
    }
    /** Push two unsigned 8-bit integers. */
    pushUint8x2(x, y) {
        this.pushUint8(x);
        this.pushUint8(y);
        return this;
    }
    /** Push four unsigned 8-bit integers. */
    pushUint8x4(x, y, z, w) {
        this.pushUint8(x);
        this.pushUint8(y);
        this.pushUint8(z);
        this.pushUint8(w);
        return this;
    }
    /** Push a signed 8-bit integer. */
    pushSint8(value) {
        this._view.setInt8(this._offset, value);
        this._offset += 1;
        return this;
    }
    /** Push two signed 8-bit integers. */
    pushSint8x2(x, y) {
        this.pushSint8(x);
        this.pushSint8(y);
        return this;
    }
    /** Push four signed 8-bit integers. */
    pushSint8x4(x, y, z, w) {
        this.pushSint8(x);
        this.pushSint8(y);
        this.pushSint8(z);
        this.pushSint8(w);
        return this;
    }
    /** Push an unsigned 16-bit integer (little-endian). */
    pushUint16(value) {
        this._view.setUint16(this._offset, value, true);
        this._offset += 2;
        return this;
    }
    /** Push two unsigned 16-bit integers (little-endian). */
    pushUint16x2(x, y) {
        this.pushUint16(x);
        this.pushUint16(y);
        return this;
    }
    /** Push four unsigned 16-bit integers (little-endian). */
    pushUint16x4(x, y, z, w) {
        this.pushUint16(x);
        this.pushUint16(y);
        this.pushUint16(z);
        this.pushUint16(w);
        return this;
    }
    /** Push a signed 16-bit integer (little-endian). */
    pushSint16(value) {
        this._view.setInt16(this._offset, value, true);
        this._offset += 2;
        return this;
    }
    /** Push two signed 16-bit integers (little-endian). */
    pushSint16x2(x, y) {
        this.pushSint16(x);
        this.pushSint16(y);
        return this;
    }
    /** Push four signed 16-bit integers (little-endian). */
    pushSint16x4(x, y, z, w) {
        this.pushSint16(x);
        this.pushSint16(y);
        this.pushSint16(z);
        this.pushSint16(w);
        return this;
    }
    /** Push a 16-bit float (little-endian). */
    pushFloat16(value) {
        const bits = (0,_utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_0__.float32ToFloat16)(value);
        this._view.setUint16(this._offset, bits, true);
        this._offset += 2;
        return this;
    }
    /** Push two 16-bit floats (little-endian). */
    pushFloat16x2(x, y) {
        this.pushFloat16(x);
        this.pushFloat16(y);
        return this;
    }
    /** Push four 16-bit floats (little-endian). */
    pushFloat16x4(x, y, z, w) {
        this.pushFloat16(x);
        this.pushFloat16(y);
        this.pushFloat16(z);
        this.pushFloat16(w);
        return this;
    }
    /** Push a 32-bit float (little-endian). */
    pushFloat32(value) {
        this._view.setFloat32(this._offset, value, true);
        this._offset += 4;
        return this;
    }
    /** Push two 32-bit floats (little-endian). */
    pushFloat32x2(arr) {
        this.pushFloat32(arr[0]);
        this.pushFloat32(arr[1]);
        return this;
    }
    /** Push four 32-bit floats (little-endian). */
    pushFloat32x3(arr) {
        this.pushFloat32(arr[0]);
        this.pushFloat32(arr[1]);
        this.pushFloat32(arr[2]);
        return this;
    }
    /** Push an 8-bit float (little-endian). */
    pushFloat32x4(arr) {
        this.pushFloat32(arr[0]);
        this.pushFloat32(arr[1]);
        this.pushFloat32(arr[2]);
        this.pushFloat32(arr[3]);
        return this;
    }
    /** Push an unsigned 32-bit integer (little-endian). */
    pushUint32(value) {
        this._view.setUint32(this._offset, value, true);
        this._offset += 4;
        return this;
    }
    /** Push two unsigned 32-bit integers (little-endian). */
    pushUint32x2(arr) {
        this.pushUint32(arr[0]);
        this.pushUint32(arr[1]);
        return this;
    }
    /** Push three unsigned 32-bit integers (little-endian). */
    pushUint32x3(arr) {
        this.pushUint32(arr[0]);
        this.pushUint32(arr[1]);
        this.pushUint32(arr[2]);
        return this;
    }
    /** Push four unsigned 32-bit integers (little-endian). */
    pushUint32x4(arr) {
        this.pushUint32(arr[0]);
        this.pushUint32(arr[1]);
        this.pushUint32(arr[2]);
        this.pushUint32(arr[3]);
        return this;
    }
    /** Push a signed 32-bit integer (little-endian). */
    pushSint32(value) {
        this._view.setInt32(this._offset, value, true);
        this._offset += 4;
        return this;
    }
    /** Push two signed 32-bit integers (little-endian). */
    pushSint32x2(arr) {
        this.pushSint32(arr[0]);
        this.pushSint32(arr[1]);
        return this;
    }
    /** Push three signed 32-bit integers (little-endian). */
    pushSint32x3(arr) {
        this.pushSint32(arr[0]);
        this.pushSint32(arr[1]);
        this.pushSint32(arr[2]);
        return this;
    }
    /** Push four signed 32-bit integers (little-endian). */
    pushSint32x4(arr) {
        this.pushSint32(arr[0]);
        this.pushSint32(arr[1]);
        this.pushSint32(arr[2]);
        this.pushSint32(arr[3]);
        return this;
    }
    /** Returns the underlying ArrayBuffer containing all written data. */
    get arrayBuffer() {
        return this._buffer;
    }
}


/***/ }),

/***/ "./src/buffers/UniformBuffer.ts":
/*!**************************************!*\
  !*** ./src/buffers/UniformBuffer.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseType: () => (/* binding */ BaseType),
/* harmony export */   UniformBuffer: () => (/* binding */ UniformBuffer),
/* harmony export */   UniformBufferLayout: () => (/* binding */ UniformBufferLayout),
/* harmony export */   UniformBufferLayoutBuilder: () => (/* binding */ UniformBufferLayoutBuilder)
/* harmony export */ });
/* harmony import */ var _Buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Buffer */ "./src/buffers/Buffer.ts");
/* harmony import */ var _utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/float32ToFloat16 */ "./src/utils/float32ToFloat16.ts");


/**
 * Primitive base types supported by the uniform buffer helpers.
 * These correspond to WGSL scalar types used inside UBOs.
 */
var BaseType;
(function (BaseType) {
    BaseType[BaseType["Float16"] = 0] = "Float16";
    BaseType[BaseType["Float32"] = 1] = "Float32";
    BaseType[BaseType["Uint"] = 2] = "Uint";
    BaseType[BaseType["Sint"] = 3] = "Sint";
    BaseType[BaseType["Boolean"] = 4] = "Boolean";
})(BaseType || (BaseType = {}));
function sizeForBaseType(type) {
    switch (type) {
        case BaseType.Float16:
            return 2;
        case BaseType.Float32:
            return 4;
        case BaseType.Boolean:
            return 1;
        default:
            throw new Error("Unknown BaseType.");
    }
}
var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["Scalar"] = 0] = "Scalar";
    ContainerType[ContainerType["Vec"] = 1] = "Vec";
    ContainerType[ContainerType["Matrix"] = 2] = "Matrix";
    ContainerType[ContainerType["Array"] = 3] = "Array";
})(ContainerType || (ContainerType = {}));
class MemberType {
    constructor(baseType, containerType, numRows, numCols) {
        this.numRows = 1;
        this.numCols = 1;
        if (containerType === ContainerType.Scalar && numRows !== 1 && numCols !== 1) {
            throw new Error("Scalar member must have numRows = 1.");
        }
        this.baseType = baseType;
        this.containerType = containerType;
        this.numRows = numRows;
        this.numCols = numCols;
    }
    get size() {
        // when we're dealing with matrices, storing vec3f internally stores as vec4f
        const numRows = this.numCols > 1 && this.numRows === 3 ? 4 : this.numRows;
        return sizeForBaseType(this.baseType) * numRows * this.numCols;
    }
    get alignment() {
        const numElements = this.numRows === 3 ? 4 : this.numRows;
        // matrices are also just aligned to their underlying vec alignment
        return sizeForBaseType(this.baseType) * numElements;
    }
}
class UniformBufferLayoutBuilder {
    constructor() {
        this._size = 0;
        this._members = new Map();
    }
    /**
     * Reserve an explicit size for the resulting UBO layout. If not set the
     * builder will compute a size that fits all declared members.
     */
    withSize(size) {
        if (this._size !== 0)
            throw new Error("Size already set.");
        this._size = size;
        return this;
    }
    pushScalar(baseType, name) {
        return this._pushField(baseType, name, ContainerType.Scalar);
    }
    pushVec2(baseType, name) {
        return this._pushField(baseType, name, ContainerType.Vec, 2);
    }
    pushVec3(baseType, name) {
        return this._pushField(baseType, name, ContainerType.Vec, 3);
    }
    pushVec4(baseType, name) {
        return this._pushField(baseType, name, ContainerType.Vec, 4);
    }
    pushMatrix(baseType, numRows, numCols, name) {
        if (!Number.isInteger(numRows) || !Number.isInteger(numCols)) {
            throw new Error('Matrix dimensions must be integers');
        }
        if (numRows < 2 || numRows > 4 || numCols < 2 || numCols > 4) {
            throw new Error('Matrix dimensions must be between 2 and 4 (inclusive)');
        }
        return this._pushField(baseType, name, ContainerType.Matrix, numRows, numCols);
    }
    /**
     * Finalize and return a `UniformBufferLayout` describing member offsets and total size.
     */
    build() {
        // round up to 16 byte alignment with a 16 byte minimum
        this._size = Math.ceil(this._size / 16) * 16;
        return new UniformBufferLayout(this._size, this._members);
    }
    _pushField(baseType, name, containerType, numRows = 1, numCols = 1) {
        const type = new MemberType(baseType, containerType, numRows, numCols);
        const alignment = type.alignment;
        const offset = Math.ceil(this._size / alignment) * alignment;
        this._members.set(name, { offset, type });
        this._size = offset + type.size;
        return this;
    }
}
/**
 * Describes the layout of a uniform buffer including member offsets and total size.
 * Use `UniformBufferLayoutBuilder` to construct instances.
 */
class UniformBufferLayout {
    constructor(size, members) {
        this.size = size;
        this._members = members;
    }
    /**
     * Create typed DataViews for each member of the layout.
     * @internal
     */
    _createDataViews(target) {
        const map = new Map();
        for (const [name, member] of this._members) {
            let ArrayConst;
            const size = member.type.size;
            let byteSize = 4;
            switch (member.type.baseType) {
                case BaseType.Float16:
                    byteSize = 2;
                    ArrayConst = Uint16Array;
                    break;
                case BaseType.Float32:
                    ArrayConst = Float32Array;
                    break;
                case BaseType.Uint:
                case BaseType.Boolean:
                    ArrayConst = Uint32Array;
                    break;
                case BaseType.Sint:
                    ArrayConst = Int32Array;
                    break;
            }
            map.set(name, [member, new ArrayConst(target, member.offset, size / byteSize)]);
        }
        return map;
    }
    _getMemberOrThrow(name) {
        const member = this._members.get(name);
        if (!member) {
            throw new Error(`Member ${name} not found in layout.`);
        }
        return member;
    }
}
/**
 * GPU-backed uniform buffer wrapper providing typed setters and an upload method.
 * Use {@link TinyHelix.createUniformBuffer} to create instances.
 */
class UniformBuffer {
    /**
     * Create a new UniformBuffer with the given layout and WebGPU context.
     * @internal
     */
    constructor(layout, ctx) {
        this._dataViews = new Map();
        const data = new ArrayBuffer(layout.size);
        this._buffer = new _Buffer__WEBPACK_IMPORTED_MODULE_0__.BufferBuilder(ctx)
            .withUsage(GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST)
            .withData(data, true)
            .build();
        this._data = this._buffer.data;
        this._dataViews = layout._createDataViews(this._data);
        // hmmm let's think a bit here.
        // We could go through all the members of the layout and create typed views for them, so we don't need all the
        // _write functions upstairs
        this._ctx = ctx;
    }
    /**
     * Sets the value of a scalar field.
     * @param name Name of the scalar field.
     * @param value Value to set.
     */
    setScalar(name, value) {
        const [member, target] = this._dataViews.get(name);
        if (member.type.baseType === BaseType.Float16) {
            target[0] = (0,_utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_1__.float32ToFloat16)(value);
        }
        else {
            target[0] = value;
        }
        return this;
    }
    /**
     * Sets the values for a vector field.
     * @param name Name of the vector field.
     * @param values Array of values to set.
     */
    setVec(name, values) {
        const [member, target] = this._dataViews.get(name);
        if (member.type.baseType == BaseType.Float16) {
            for (let i = 0; i < values.length; ++i) {
                target[i] = (0,_utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_1__.float32ToFloat16)(values[i]);
            }
        }
        else {
            for (let i = 0; i < values.length; ++i) {
                target[i] = values[i];
            }
        }
        return this;
    }
    /**
     * Sets the values for a matrix field.
     * @param name Name of the matrix field.
     * @param values Array of values to set. The values are expected to be in column-major order.
     */
    setMatrix(name, values) {
        const [member, target] = this._dataViews.get(name);
        const numCols = member.type.numCols;
        const numRows = member.type.numRows;
        const skipW = numRows === 3;
        // I know looping inside the cases looks ugly and the loops are tiny, but I just can't bring myself to put
        // a switch in a loop
        let i = 0;
        if (member.type.baseType === BaseType.Float16) {
            for (let col = 0; col < numCols; ++col) {
                for (let row = 0; row < numRows; ++row) {
                    target[i] = (0,_utils_float32ToFloat16__WEBPACK_IMPORTED_MODULE_1__.float32ToFloat16)(values[i]);
                    ++i;
                }
                if (skipW)
                    ++i;
            }
        }
        else {
            for (let col = 0; col < numCols; ++col) {
                for (let row = 0; row < numRows; ++row) {
                    target[i] = values[i];
                    ++i;
                }
                if (skipW)
                    ++i;
            }
        }
        return this;
    }
    /**
     * Upload the current buffer contents to the GPU.
     */
    upload() {
        this._buffer._uploadData(this._ctx);
        return this;
    }
    /**
     * Internal accessor returning the underlying Buffer wrapper.
     * @internal
     */
    _getBufferResource() {
        return { buffer: this._buffer._inner };
    }
}


/***/ }),

/***/ "./src/enums.ts":
/*!**********************!*\
  !*** ./src/enums.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AddressMode: () => (/* binding */ AddressMode),
/* harmony export */   BlendFactor: () => (/* binding */ BlendFactor),
/* harmony export */   ColorSpace: () => (/* binding */ ColorSpace),
/* harmony export */   CompareFunction: () => (/* binding */ CompareFunction),
/* harmony export */   CullMode: () => (/* binding */ CullMode),
/* harmony export */   FilterMode: () => (/* binding */ FilterMode),
/* harmony export */   StorageAccess: () => (/* binding */ StorageAccess),
/* harmony export */   TextureFormat: () => (/* binding */ TextureFormat)
/* harmony export */ });
var ColorSpace;
(function (ColorSpace) {
    ColorSpace["sRGB"] = "srgb";
    ColorSpace["DisplayP3"] = "display-p3";
})(ColorSpace || (ColorSpace = {}));
var FilterMode;
(function (FilterMode) {
    FilterMode["Nearest"] = "nearest";
    FilterMode["Linear"] = "linear";
})(FilterMode || (FilterMode = {}));
var AddressMode;
(function (AddressMode) {
    AddressMode["ClampToEdge"] = "clamp-to-edge";
    AddressMode["Repeat"] = "repeat";
    AddressMode["MirrorRepeat"] = "mirror-repeat";
})(AddressMode || (AddressMode = {}));
/**
 * Face culling modes used by the render pipeline primitive state.
 */
var CullMode;
(function (CullMode) {
    CullMode["None"] = "none";
    CullMode["Front"] = "front";
    CullMode["Back"] = "back";
})(CullMode || (CullMode = {}));
var TextureFormat;
(function (TextureFormat) {
    TextureFormat["R8Unorm"] = "r8unorm";
    TextureFormat["R8Snorm"] = "r8snorm";
    TextureFormat["R8Uint"] = "r8uint";
    TextureFormat["R8Sint"] = "r8sint";
    TextureFormat["R16Unorm"] = "r16unorm";
    TextureFormat["R16Snorm"] = "r16snorm";
    TextureFormat["R16Uint"] = "r16uint";
    TextureFormat["R16Sint"] = "r16sint";
    TextureFormat["R16Float"] = "r16float";
    TextureFormat["RG8Unorm"] = "rg8unorm";
    TextureFormat["RG8Snorm"] = "rg8snorm";
    TextureFormat["RG8Uint"] = "rg8uint";
    TextureFormat["RG8Sint"] = "rg8sint";
    TextureFormat["R32Uint"] = "r32uint";
    TextureFormat["R32Sint"] = "r32sint";
    TextureFormat["R32Float"] = "r32float";
    TextureFormat["RG16Unorm"] = "rg16unorm";
    TextureFormat["RG16Snorm"] = "rg16snorm";
    TextureFormat["RG16Uint"] = "rg16uint";
    TextureFormat["RG16Sint"] = "rg16sint";
    TextureFormat["RG16Float"] = "rg16float";
    TextureFormat["Rgba8Unorm"] = "rgba8unorm";
    TextureFormat["Rgba8UnormSrgb"] = "rgba8unorm-srgb";
    TextureFormat["Rgba8Snorm"] = "rgba8snorm";
    TextureFormat["Rgba8Uint"] = "rgba8uint";
    TextureFormat["Rgba8Sint"] = "rgba8sint";
    TextureFormat["Bgra8Unorm"] = "bgra8unorm";
    TextureFormat["Bgra8UnormSrgb"] = "bgra8unorm-srgb";
    TextureFormat["Rgb9e5Ufloat"] = "rgb9e5ufloat";
    TextureFormat["Rgb10a2Uint"] = "rgb10a2uint";
    TextureFormat["Rgb10a2Unorm"] = "rgb10a2unorm";
    TextureFormat["Rg11b10Ufloat"] = "rg11b10ufloat";
    TextureFormat["RG32Uint"] = "rg32uint";
    TextureFormat["RG32Sint"] = "rg32sint";
    TextureFormat["RG32Float"] = "rg32float";
    TextureFormat["Rgba16Unorm"] = "rgba16unorm";
    TextureFormat["Rgba16Snorm"] = "rgba16snorm";
    TextureFormat["Rgba16Uint"] = "rgba16uint";
    TextureFormat["Rgba16Sint"] = "rgba16sint";
    TextureFormat["Rgba16Float"] = "rgba16float";
    TextureFormat["Rgba32Uint"] = "rgba32uint";
    TextureFormat["Rgba32Sint"] = "rgba32sint";
    TextureFormat["Rgba32Float"] = "rgba32float";
    TextureFormat["Stencil8"] = "stencil8";
    TextureFormat["Depth16Unorm"] = "depth16unorm";
    TextureFormat["Depth24Plus"] = "depth24plus";
    TextureFormat["Depth24PlusStencil8"] = "depth24plus-stencil8";
    TextureFormat["Depth32Float"] = "depth32float";
    TextureFormat["Depth32FloatStencil8"] = "depth32float-stencil8";
    TextureFormat["Bc1RgbaUnorm"] = "bc1-rgba-unorm";
    TextureFormat["Bc1RgbaUnormSrgb"] = "bc1-rgba-unorm-srgb";
    TextureFormat["Bc2RgbaUnorm"] = "bc2-rgba-unorm";
    TextureFormat["Bc2RgbaUnormSrgb"] = "bc2-rgba-unorm-srgb";
    TextureFormat["Bc3RgbaUnorm"] = "bc3-rgba-unorm";
    TextureFormat["Bc3RgbaUnormSrgb"] = "bc3-rgba-unorm-srgb";
    TextureFormat["Bc4RUnorm"] = "bc4-r-unorm";
    TextureFormat["Bc4RSnorm"] = "bc4-r-snorm";
    TextureFormat["Bc5RgUnorm"] = "bc5-rg-unorm";
    TextureFormat["Bc5RgSnorm"] = "bc5-rg-snorm";
    TextureFormat["Bc6hRgbUfloat"] = "bc6h-rgb-ufloat";
    TextureFormat["Bc6hRgbFloat"] = "bc6h-rgb-float";
    TextureFormat["Bc7RgbaUnorm"] = "bc7-rgba-unorm";
    TextureFormat["Bc7RgbaUnormSrgb"] = "bc7-rgba-unorm-srgb";
    TextureFormat["Etc2Rgb8Unorm"] = "etc2-rgb8unorm";
    TextureFormat["Etc2Rgb8UnormSrgb"] = "etc2-rgb8unorm-srgb";
    TextureFormat["Etc2Rgb8A1Unorm"] = "etc2-rgb8a1unorm";
    TextureFormat["Etc2Rgb8A1UnormSrgb"] = "etc2-rgb8a1unorm-srgb";
    TextureFormat["Etc2Rgba8Unorm"] = "etc2-rgba8unorm";
    TextureFormat["Etc2Rgba8UnormSrgb"] = "etc2-rgba8unorm-srgb";
    TextureFormat["EacR11Unorm"] = "eac-r11unorm";
    TextureFormat["EacR11Snorm"] = "eac-r11snorm";
    TextureFormat["EacRg11Unorm"] = "eac-rg11unorm";
    TextureFormat["EacRg11Snorm"] = "eac-rg11snorm";
    TextureFormat["Astc4x4Unorm"] = "astc-4x4-unorm";
    TextureFormat["Astc4x4UnormSrgb"] = "astc-4x4-unorm-srgb";
    TextureFormat["Astc5x4Unorm"] = "astc-5x4-unorm";
    TextureFormat["Astc5x4UnormSrgb"] = "astc-5x4-unorm-srgb";
    TextureFormat["Astc5x5Unorm"] = "astc-5x5-unorm";
    TextureFormat["Astc5x5UnormSrgb"] = "astc-5x5-unorm-srgb";
    TextureFormat["Astc6x5Unorm"] = "astc-6x5-unorm";
    TextureFormat["Astc6x5UnormSrgb"] = "astc-6x5-unorm-srgb";
    TextureFormat["Astc6x6Unorm"] = "astc-6x6-unorm";
    TextureFormat["Astc6x6UnormSrgb"] = "astc-6x6-unorm-srgb";
    TextureFormat["Astc8x5Unorm"] = "astc-8x5-unorm";
    TextureFormat["Astc8x5UnormSrgb"] = "astc-8x5-unorm-srgb";
    TextureFormat["Astc8x6Unorm"] = "astc-8x6-unorm";
    TextureFormat["Astc8x6UnormSrgb"] = "astc-8x6-unorm-srgb";
    TextureFormat["Astc8x8Unorm"] = "astc-8x8-unorm";
    TextureFormat["Astc8x8UnormSrgb"] = "astc-8x8-unorm-srgb";
    TextureFormat["Astc10x5Unorm"] = "astc-10x5-unorm";
    TextureFormat["Astc10x5UnormSrgb"] = "astc-10x5-unorm-srgb";
    TextureFormat["Astc10x6Unorm"] = "astc-10x6-unorm";
    TextureFormat["Astc10x6UnormSrgb"] = "astc-10x6-unorm-srgb";
    TextureFormat["Astc10x8Unorm"] = "astc-10x8-unorm";
    TextureFormat["Astc10x8UnormSrgb"] = "astc-10x8-unorm-srgb";
    TextureFormat["Astc10x10Unorm"] = "astc-10x10-unorm";
    TextureFormat["Astc10x10UnormSrgb"] = "astc-10x10-unorm-srgb";
    TextureFormat["Astc12x10Unorm"] = "astc-12x10-unorm";
    TextureFormat["Astc12x10UnormSrgb"] = "astc-12x10-unorm-srgb";
    TextureFormat["Astc12x12Unorm"] = "astc-12x12-unorm";
    TextureFormat["Astc12x12UnormSrgb"] = "astc-12x12-unorm-srgb";
})(TextureFormat || (TextureFormat = {}));
var BlendFactor;
(function (BlendFactor) {
    BlendFactor["Zero"] = "zero";
    BlendFactor["One"] = "one";
    BlendFactor["SrcColor"] = "src";
    BlendFactor["OneMinusSrcColor"] = "one-minus-src";
    BlendFactor["SrcAlpha"] = "src-alpha";
    BlendFactor["OneMinusSrcAlpha"] = "one-minus-src-alpha";
    BlendFactor["DstColor"] = "dst";
    BlendFactor["OneMinusDstColor"] = "one-minus-dst";
    BlendFactor["DstAlpha"] = "dst-alpha";
    BlendFactor["OneMinusDstAlpha"] = "one-minus-dst-alpha";
    BlendFactor["SrcAlphaSaturated"] = "src-alpha-saturated";
    BlendFactor["Constant"] = "constant";
    BlendFactor["OneMinusConstant"] = "one-minus-constant";
    BlendFactor["Src1Color"] = "src1";
    BlendFactor["OneMinusSrc1Color"] = "one-minus-src1";
    BlendFactor["Src1Alpha"] = "src1-alpha";
    BlendFactor["OneMinusSrc1Alpha"] = "one-minus-src1-alpha";
})(BlendFactor || (BlendFactor = {}));
var CompareFunction;
(function (CompareFunction) {
    CompareFunction["Never"] = "never";
    CompareFunction["Less"] = "less";
    CompareFunction["Equal"] = "equal";
    CompareFunction["LessEqual"] = "less-equal";
    CompareFunction["Greater"] = "greater";
    CompareFunction["NotEqual"] = "not-equal";
    CompareFunction["GreaterEqual"] = "greater-equal";
    CompareFunction["Always"] = "always";
})(CompareFunction || (CompareFunction = {}));
var StorageAccess;
(function (StorageAccess) {
    StorageAccess["ReadWrite"] = "read-write";
    StorageAccess["Read"] = "read-only";
    StorageAccess["Write"] = "write-only";
})(StorageAccess || (StorageAccess = {}));


/***/ }),

/***/ "./src/utils/float32ToFloat16.ts":
/*!***************************************!*\
  !*** ./src/utils/float32ToFloat16.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   float32ToFloat16: () => (/* binding */ float32ToFloat16)
/* harmony export */ });
/**
 * Convert a JavaScript number (float32) to IEEE 754 binary16 (float16) representation.
 * Returns the 16-bit unsigned integer bit pattern for the half-float.
 */
function float32ToFloat16(value) {
    // This is a compact implementation adapted for correctness.
    const f32 = new Float32Array(1);
    f32[0] = value;
    const f32u = new Uint32Array(f32.buffer)[0];
    const sign = (f32u >> 16) & 0x8000;
    const exponent = ((f32u >> 23) & 0xff) - 127;
    const mantissa = f32u & 0x007fffff;
    if (exponent <= -15) {
        // Too small to be represented as a normalized half-float -> zero or subnormal
        // Round-to-zero behavior
        return sign;
    }
    if (exponent > 16) {
        // Overflow -> return Infinity
        return sign | 0x7c00;
    }
    const halfExp = exponent + 15;
    const halfMant = mantissa >> 13;
    return sign | (halfExp << 10) | halfMant;
}


/***/ }),

/***/ "./src/utils/mapUndefined.ts":
/*!***********************************!*\
  !*** ./src/utils/mapUndefined.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapUndefined: () => (/* binding */ mapUndefined)
/* harmony export */ });
/**
 * Maps undefined values to undefined and non-undefined values to the result of fn. Similar to Rust's `Option<T>::map`.
 * @param value The value to map.
 * @param fn The mapping function.
 */
function mapUndefined(value, fn) {
    if (value === undefined) {
        return undefined;
    }
    return fn(value);
}


/***/ }),

/***/ "./src/utils/padArrayBuffer.ts":
/*!*************************************!*\
  !*** ./src/utils/padArrayBuffer.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   padArrayBuffer: () => (/* binding */ padArrayBuffer)
/* harmony export */ });
/**
 * Pad an ArrayBuffer (or SharedArrayBuffer) to the given alignment in bytes.
 * If the input is already aligned, the original buffer is returned. Otherwise a
 * new buffer is allocated, the contents copied, and the new buffer returned.
 *
 * @param input - The input ArrayBuffer or SharedArrayBuffer to pad
 * @param alignment - Desired byte alignment (e.g. 4 for 32-bit alignment)
 * @returns A buffer with byteLength rounded up to the nearest multiple of alignment
 */
function padArrayBuffer(input, alignment) {
    const targetSize = Math.ceil(input.byteLength / alignment) * alignment;
    if (targetSize === input.byteLength)
        return input;
    const data = input instanceof ArrayBuffer ? new ArrayBuffer(targetSize) : new SharedArrayBuffer(targetSize);
    const src = new Uint8Array(input);
    const dst = new Uint8Array(data);
    dst.set(src);
    return data;
}


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AddressMode: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.AddressMode),
/* harmony export */   BaseType: () => (/* reexport safe */ _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_16__.BaseType),
/* harmony export */   BindGroup: () => (/* reexport safe */ _BindGroup__WEBPACK_IMPORTED_MODULE_2__.BindGroup),
/* harmony export */   BindGroupBuilder: () => (/* reexport safe */ _BindGroup__WEBPACK_IMPORTED_MODULE_2__.BindGroupBuilder),
/* harmony export */   BindGroupLayout: () => (/* reexport safe */ _BindGroup__WEBPACK_IMPORTED_MODULE_2__.BindGroupLayout),
/* harmony export */   BlendFactor: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.BlendFactor),
/* harmony export */   BlendMode: () => (/* reexport safe */ _BlendMode__WEBPACK_IMPORTED_MODULE_3__.BlendMode),
/* harmony export */   Buffer: () => (/* reexport safe */ _buffers_Buffer__WEBPACK_IMPORTED_MODULE_15__.Buffer),
/* harmony export */   BufferBuilder: () => (/* reexport safe */ _buffers_Buffer__WEBPACK_IMPORTED_MODULE_15__.BufferBuilder),
/* harmony export */   BufferDataWriter: () => (/* reexport safe */ _buffers_BufferDataWriter__WEBPACK_IMPORTED_MODULE_17__.BufferDataWriter),
/* harmony export */   BufferUsage: () => (/* reexport safe */ _buffers_Buffer__WEBPACK_IMPORTED_MODULE_15__.BufferUsage),
/* harmony export */   ColorSpace: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.ColorSpace),
/* harmony export */   CommandEncoder: () => (/* reexport safe */ _CommandEncoder__WEBPACK_IMPORTED_MODULE_4__.CommandEncoder),
/* harmony export */   CompareFunction: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.CompareFunction),
/* harmony export */   ComputePass: () => (/* reexport safe */ _ComputePass__WEBPACK_IMPORTED_MODULE_5__.ComputePass),
/* harmony export */   ComputePassBuilder: () => (/* reexport safe */ _ComputePass__WEBPACK_IMPORTED_MODULE_5__.ComputePassBuilder),
/* harmony export */   ComputePipeline: () => (/* reexport safe */ _ComputePipeline__WEBPACK_IMPORTED_MODULE_6__.ComputePipeline),
/* harmony export */   ComputePipelineBuilder: () => (/* reexport safe */ _ComputePipeline__WEBPACK_IMPORTED_MODULE_6__.ComputePipelineBuilder),
/* harmony export */   CullMode: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.CullMode),
/* harmony export */   FilterMode: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.FilterMode),
/* harmony export */   FrontFace: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.FrontFace),
/* harmony export */   IndexFormat: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.IndexFormat),
/* harmony export */   Mesh: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.Mesh),
/* harmony export */   MeshBuilder: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.MeshBuilder),
/* harmony export */   MeshTopology: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.MeshTopology),
/* harmony export */   RenderPass: () => (/* reexport safe */ _RenderPass__WEBPACK_IMPORTED_MODULE_9__.RenderPass),
/* harmony export */   RenderPassBuilder: () => (/* reexport safe */ _RenderPass__WEBPACK_IMPORTED_MODULE_9__.RenderPassBuilder),
/* harmony export */   RenderPipeline: () => (/* reexport safe */ _RenderPipeline__WEBPACK_IMPORTED_MODULE_10__.RenderPipeline),
/* harmony export */   RenderPipelineBuilder: () => (/* reexport safe */ _RenderPipeline__WEBPACK_IMPORTED_MODULE_10__.RenderPipelineBuilder),
/* harmony export */   RenderTarget: () => (/* reexport safe */ _RenderTarget__WEBPACK_IMPORTED_MODULE_11__.RenderTarget),
/* harmony export */   RenderTargetBuilder: () => (/* reexport safe */ _RenderTarget__WEBPACK_IMPORTED_MODULE_11__.RenderTargetBuilder),
/* harmony export */   Sampler: () => (/* reexport safe */ _Sampler__WEBPACK_IMPORTED_MODULE_12__.Sampler),
/* harmony export */   SamplerBuilder: () => (/* reexport safe */ _Sampler__WEBPACK_IMPORTED_MODULE_12__.SamplerBuilder),
/* harmony export */   Shader: () => (/* reexport safe */ _Shader__WEBPACK_IMPORTED_MODULE_13__.Shader),
/* harmony export */   ShaderBuilder: () => (/* reexport safe */ _Shader__WEBPACK_IMPORTED_MODULE_13__.ShaderBuilder),
/* harmony export */   StorageAccess: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.StorageAccess),
/* harmony export */   StreamBuilder: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.StreamBuilder),
/* harmony export */   Texture: () => (/* reexport safe */ _Texture__WEBPACK_IMPORTED_MODULE_14__.Texture),
/* harmony export */   TextureBuilder: () => (/* reexport safe */ _Texture__WEBPACK_IMPORTED_MODULE_14__.TextureBuilder),
/* harmony export */   TextureFormat: () => (/* reexport safe */ _enums__WEBPACK_IMPORTED_MODULE_7__.TextureFormat),
/* harmony export */   TextureUsage: () => (/* reexport safe */ _buffers_Buffer__WEBPACK_IMPORTED_MODULE_15__.TextureUsage),
/* harmony export */   TextureView: () => (/* reexport safe */ _Texture__WEBPACK_IMPORTED_MODULE_14__.TextureView),
/* harmony export */   TextureViewBuilder: () => (/* reexport safe */ _Texture__WEBPACK_IMPORTED_MODULE_14__.TextureViewBuilder),
/* harmony export */   TinyHelix: () => (/* reexport safe */ _TinyHelix__WEBPACK_IMPORTED_MODULE_0__.TinyHelix),
/* harmony export */   UniformBuffer: () => (/* reexport safe */ _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_16__.UniformBuffer),
/* harmony export */   UniformBufferLayout: () => (/* reexport safe */ _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_16__.UniformBufferLayout),
/* harmony export */   UniformBufferLayoutBuilder: () => (/* reexport safe */ _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_16__.UniformBufferLayoutBuilder),
/* harmony export */   VertexFormat: () => (/* reexport safe */ _Mesh__WEBPACK_IMPORTED_MODULE_8__.VertexFormat),
/* harmony export */   WebGPUContext: () => (/* reexport safe */ _WebGPUContext__WEBPACK_IMPORTED_MODULE_1__.WebGPUContext),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TinyHelix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TinyHelix */ "./src/TinyHelix.ts");
/* harmony import */ var _WebGPUContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WebGPUContext */ "./src/WebGPUContext.ts");
/* harmony import */ var _BindGroup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./BindGroup */ "./src/BindGroup.ts");
/* harmony import */ var _BlendMode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./BlendMode */ "./src/BlendMode.ts");
/* harmony import */ var _CommandEncoder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CommandEncoder */ "./src/CommandEncoder.ts");
/* harmony import */ var _ComputePass__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ComputePass */ "./src/ComputePass.ts");
/* harmony import */ var _ComputePipeline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ComputePipeline */ "./src/ComputePipeline.ts");
/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./enums */ "./src/enums.ts");
/* harmony import */ var _Mesh__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Mesh */ "./src/Mesh.ts");
/* harmony import */ var _RenderPass__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./RenderPass */ "./src/RenderPass.ts");
/* harmony import */ var _RenderPipeline__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./RenderPipeline */ "./src/RenderPipeline.ts");
/* harmony import */ var _RenderTarget__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./RenderTarget */ "./src/RenderTarget.ts");
/* harmony import */ var _Sampler__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Sampler */ "./src/Sampler.ts");
/* harmony import */ var _Shader__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Shader */ "./src/Shader.ts");
/* harmony import */ var _Texture__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Texture */ "./src/Texture.ts");
/* harmony import */ var _buffers_Buffer__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./buffers/Buffer */ "./src/buffers/Buffer.ts");
/* harmony import */ var _buffers_UniformBuffer__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./buffers/UniformBuffer */ "./src/buffers/UniformBuffer.ts");
/* harmony import */ var _buffers_BufferDataWriter__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./buffers/BufferDataWriter */ "./src/buffers/BufferDataWriter.ts");
/**
 * tiny-helix: A TypeScript library for WebGPU
 * @packageDocumentation
 */


// Default export for convenience

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_TinyHelix__WEBPACK_IMPORTED_MODULE_0__.TinyHelix);

















})();

const __webpack_exports__AddressMode = __webpack_exports__.AddressMode;
const __webpack_exports__BaseType = __webpack_exports__.BaseType;
const __webpack_exports__BindGroup = __webpack_exports__.BindGroup;
const __webpack_exports__BindGroupBuilder = __webpack_exports__.BindGroupBuilder;
const __webpack_exports__BindGroupLayout = __webpack_exports__.BindGroupLayout;
const __webpack_exports__BlendFactor = __webpack_exports__.BlendFactor;
const __webpack_exports__BlendMode = __webpack_exports__.BlendMode;
const __webpack_exports__Buffer = __webpack_exports__.Buffer;
const __webpack_exports__BufferBuilder = __webpack_exports__.BufferBuilder;
const __webpack_exports__BufferDataWriter = __webpack_exports__.BufferDataWriter;
const __webpack_exports__BufferUsage = __webpack_exports__.BufferUsage;
const __webpack_exports__ColorSpace = __webpack_exports__.ColorSpace;
const __webpack_exports__CommandEncoder = __webpack_exports__.CommandEncoder;
const __webpack_exports__CompareFunction = __webpack_exports__.CompareFunction;
const __webpack_exports__ComputePass = __webpack_exports__.ComputePass;
const __webpack_exports__ComputePassBuilder = __webpack_exports__.ComputePassBuilder;
const __webpack_exports__ComputePipeline = __webpack_exports__.ComputePipeline;
const __webpack_exports__ComputePipelineBuilder = __webpack_exports__.ComputePipelineBuilder;
const __webpack_exports__CullMode = __webpack_exports__.CullMode;
const __webpack_exports__FilterMode = __webpack_exports__.FilterMode;
const __webpack_exports__FrontFace = __webpack_exports__.FrontFace;
const __webpack_exports__IndexFormat = __webpack_exports__.IndexFormat;
const __webpack_exports__Mesh = __webpack_exports__.Mesh;
const __webpack_exports__MeshBuilder = __webpack_exports__.MeshBuilder;
const __webpack_exports__MeshTopology = __webpack_exports__.MeshTopology;
const __webpack_exports__RenderPass = __webpack_exports__.RenderPass;
const __webpack_exports__RenderPassBuilder = __webpack_exports__.RenderPassBuilder;
const __webpack_exports__RenderPipeline = __webpack_exports__.RenderPipeline;
const __webpack_exports__RenderPipelineBuilder = __webpack_exports__.RenderPipelineBuilder;
const __webpack_exports__RenderTarget = __webpack_exports__.RenderTarget;
const __webpack_exports__RenderTargetBuilder = __webpack_exports__.RenderTargetBuilder;
const __webpack_exports__Sampler = __webpack_exports__.Sampler;
const __webpack_exports__SamplerBuilder = __webpack_exports__.SamplerBuilder;
const __webpack_exports__Shader = __webpack_exports__.Shader;
const __webpack_exports__ShaderBuilder = __webpack_exports__.ShaderBuilder;
const __webpack_exports__StorageAccess = __webpack_exports__.StorageAccess;
const __webpack_exports__StreamBuilder = __webpack_exports__.StreamBuilder;
const __webpack_exports__Texture = __webpack_exports__.Texture;
const __webpack_exports__TextureBuilder = __webpack_exports__.TextureBuilder;
const __webpack_exports__TextureFormat = __webpack_exports__.TextureFormat;
const __webpack_exports__TextureUsage = __webpack_exports__.TextureUsage;
const __webpack_exports__TextureView = __webpack_exports__.TextureView;
const __webpack_exports__TextureViewBuilder = __webpack_exports__.TextureViewBuilder;
const __webpack_exports__TinyHelix = __webpack_exports__.TinyHelix;
const __webpack_exports__UniformBuffer = __webpack_exports__.UniformBuffer;
const __webpack_exports__UniformBufferLayout = __webpack_exports__.UniformBufferLayout;
const __webpack_exports__UniformBufferLayoutBuilder = __webpack_exports__.UniformBufferLayoutBuilder;
const __webpack_exports__VertexFormat = __webpack_exports__.VertexFormat;
const __webpack_exports__WebGPUContext = __webpack_exports__.WebGPUContext;
const __webpack_exports__default = __webpack_exports__["default"];
export { __webpack_exports__AddressMode as AddressMode, __webpack_exports__BaseType as BaseType, __webpack_exports__BindGroup as BindGroup, __webpack_exports__BindGroupBuilder as BindGroupBuilder, __webpack_exports__BindGroupLayout as BindGroupLayout, __webpack_exports__BlendFactor as BlendFactor, __webpack_exports__BlendMode as BlendMode, __webpack_exports__Buffer as Buffer, __webpack_exports__BufferBuilder as BufferBuilder, __webpack_exports__BufferDataWriter as BufferDataWriter, __webpack_exports__BufferUsage as BufferUsage, __webpack_exports__ColorSpace as ColorSpace, __webpack_exports__CommandEncoder as CommandEncoder, __webpack_exports__CompareFunction as CompareFunction, __webpack_exports__ComputePass as ComputePass, __webpack_exports__ComputePassBuilder as ComputePassBuilder, __webpack_exports__ComputePipeline as ComputePipeline, __webpack_exports__ComputePipelineBuilder as ComputePipelineBuilder, __webpack_exports__CullMode as CullMode, __webpack_exports__FilterMode as FilterMode, __webpack_exports__FrontFace as FrontFace, __webpack_exports__IndexFormat as IndexFormat, __webpack_exports__Mesh as Mesh, __webpack_exports__MeshBuilder as MeshBuilder, __webpack_exports__MeshTopology as MeshTopology, __webpack_exports__RenderPass as RenderPass, __webpack_exports__RenderPassBuilder as RenderPassBuilder, __webpack_exports__RenderPipeline as RenderPipeline, __webpack_exports__RenderPipelineBuilder as RenderPipelineBuilder, __webpack_exports__RenderTarget as RenderTarget, __webpack_exports__RenderTargetBuilder as RenderTargetBuilder, __webpack_exports__Sampler as Sampler, __webpack_exports__SamplerBuilder as SamplerBuilder, __webpack_exports__Shader as Shader, __webpack_exports__ShaderBuilder as ShaderBuilder, __webpack_exports__StorageAccess as StorageAccess, __webpack_exports__StreamBuilder as StreamBuilder, __webpack_exports__Texture as Texture, __webpack_exports__TextureBuilder as TextureBuilder, __webpack_exports__TextureFormat as TextureFormat, __webpack_exports__TextureUsage as TextureUsage, __webpack_exports__TextureView as TextureView, __webpack_exports__TextureViewBuilder as TextureViewBuilder, __webpack_exports__TinyHelix as TinyHelix, __webpack_exports__UniformBuffer as UniformBuffer, __webpack_exports__UniformBufferLayout as UniformBufferLayout, __webpack_exports__UniformBufferLayoutBuilder as UniformBufferLayoutBuilder, __webpack_exports__VertexFormat as VertexFormat, __webpack_exports__WebGPUContext as WebGPUContext, __webpack_exports__default as default };

//# sourceMappingURL=tiny-helix.esm.debug.js.map