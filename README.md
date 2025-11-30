# tiny-helix

A lightweight TypeScript library for WebGPU, built as an ES6 module.

## Quickstart

Install:

```bash
npm install tiny-helix
```

Or for development from source:

```bash
git clone https://github.com/DerSchmale/tiny-helix.git
cd tiny-helix
npm install
npm run build:debug   # builds non-minified debug bundles with source maps
```

## Usage (browser)

Basic example showing initialization and a simple render loop:

```ts
import TinyHelix from 'tiny-helix';

const app = new TinyHelix();
await app.initialize({ canvas: document.querySelector('canvas')! });

function frame() {
  app.startFrame();
  const encoder = app.createCommandEncoder('frame-encoder');

  // build and submit render passes with encoder.createRenderPass()

  encoder.submit();
  requestAnimationFrame(frame);
}

frame();
```

## Debug build and source maps

A development-friendly debug build is included. It produces readable, non-minified bundles with full source maps. The debug builds output the following files into `dist/`:

- `tiny-helix.debug.js` + `tiny-helix.debug.js.map` (UMD / CommonJS-like build)
- `tiny-helix.esm.debug.js` + `tiny-helix.esm.debug.js.map` (ESM build)

To create the debug bundles run:

```bash
npm run build:debug
```

The webpack configuration is set up so source maps use `file:///...` absolute file URLs instead of the `webpack://` scheme. This prevents browsers from attempting to resolve `webpack://` sources when consuming the package as a module.

## API overview

This project exposes a small set of helpers and wrappers for working with WebGPU in TypeScript. The main entry points are:

- `TinyHelix` (default export): High-level manager for a WebGPU context, backbuffer and helpers for creating render targets, shaders, meshes and render pipelines.
- `WebGPUContext`: Low-level context manager that handles adapter/device initialization and canvas configuration.
- `CommandEncoder`: Helper for recording and submitting GPU commands per-frame.
- `RenderPass`, `RenderPipeline`, `RenderTarget`, `Shader`, `Mesh`, `Texture`, and buffer helpers.

See the inline JSDoc comments in `src/` for detailed method and type information. TypeScript consumers will get typings from the `dist/index.d.ts` entry.

## Development notes

- Use `npm run build` to produce production bundles (minified, optimized).
- Use `npm run build:debug` to produce debug bundles with full source maps.
- For TypeScript projects, install `@webgpu/types` for better type completion:

```bash
npm install --save-dev @webgpu/types
```

## Requirements

- A browser with WebGPU support
- For TypeScript projects, you may want to install `@webgpu/types` for full type definitions

## License

MIT License - see [LICENSE](./LICENSE) for details.
