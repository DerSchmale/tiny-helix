# tiny-helix

A lightweight TypeScript library for WebGPU, built as an ES6 module.

## Installation

```bash
npm install tiny-helix
```

or

```bash
yarn add tiny-helix
```

## Requirements

- A browser with WebGPU support
- For TypeScript projects, you may want to install `@webgpu/types` for full type definitions

```bash
npm install @webgpu/types --save-dev
```

## Usage

### Basic Setup

```typescript
import { TinyHelix } from 'tiny-helix';

// Check if WebGPU is supported
if (!TinyHelix.isSupported()) {
  console.error('WebGPU is not supported');
}

// Create and initialize
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const helix = new TinyHelix();

await helix.initialize({ canvas });

// Clear the canvas
helix.renderer?.clearColor = { r: 0.1, g: 0.2, b: 0.3, a: 1.0 };
helix.renderer?.clear();
```

### Creating a Render Pipeline

```typescript
const vertexShader = `
@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(
    vec2f(0.0, 0.5),
    vec2f(-0.5, -0.5),
    vec2f(0.5, -0.5)
  );
  return vec4f(pos[vertexIndex], 0.0, 1.0);
}
`;

const fragmentShader = `
@fragment
fn main() -> @location(0) vec4f {
  return vec4f(1.0, 0.0, 0.0, 1.0);
}
`;

const pipeline = helix.createPipeline({
  vertexShader,
  fragmentShader,
});
```

### Creating Buffers

```typescript
// Create a buffer with data
const vertices = new Float32Array([
  0.0, 0.5,
  -0.5, -0.5,
  0.5, -0.5,
]);

const vertexBuffer = helix.createBufferWithData(
  vertices,
  GPUBufferUsage.VERTEX
);
```

### ES Module Import

The library is built as an ES6 module and can be imported directly:

```javascript
// ES Module import
import TinyHelix from 'tiny-helix';

// Named exports
import { TinyHelix, WebGPUContext, Renderer, Pipeline, Buffer } from 'tiny-helix';
```

### UMD/CommonJS

For environments that require UMD or CommonJS:

```javascript
// CommonJS
const TinyHelix = require('tiny-helix');
```

## API Reference

### TinyHelix

Main entry point for the library.

- `new TinyHelix(options?)` - Create a new instance
- `TinyHelix.isSupported()` - Check if WebGPU is supported
- `initialize(options?)` - Initialize WebGPU
- `createPipeline(options)` - Create a render pipeline
- `createBuffer(options)` - Create a GPU buffer
- `createBufferWithData(data, usage, label?)` - Create a buffer with initial data
- `destroy()` - Release all resources

### WebGPUContext

Manages WebGPU adapter, device, and context.

- `initialize(options?)` - Initialize WebGPU
- `isSupported()` - Check if WebGPU is supported
- `destroy()` - Release resources

### Renderer

Basic rendering functionality.

- `beginFrame()` - Start a new frame
- `beginRenderPass(encoder)` - Create a render pass
- `endFrame(encoder)` - Submit commands
- `clear()` - Clear the canvas

### Pipeline

Wrapper for WebGPU render pipelines.

- `create(options)` - Create the pipeline
- `destroy()` - Release resources

### Buffer

Wrapper for GPU buffers.

- `create(options)` - Create a buffer
- `createWithData(data, usage, label?)` - Create with initial data
- `update(data, offset?)` - Update buffer contents
- `destroy()` - Release resources

## License

MIT License - see [LICENSE](./LICENSE) for details.
