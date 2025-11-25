import { TinyHelix, WebGPUContext } from './index';

describe('TinyHelix', () => {
  describe('static methods', () => {
    it('should check if WebGPU is supported', () => {
      // In Node.js environment, WebGPU is not supported
      expect(TinyHelix.isSupported()).toBe(false);
    });
  });

  describe('instance', () => {
    it('should create a new instance', () => {
      const helix = new TinyHelix();
      expect(helix).toBeInstanceOf(TinyHelix);
      expect(helix.initialized).toBe(false);
    });

    it('should have a context', () => {
      const helix = new TinyHelix();
      expect(helix.context).toBeInstanceOf(WebGPUContext);
    });

    it('should not have renderer before initialization', () => {
      const helix = new TinyHelix();
      expect(helix.renderer).toBeNull();
    });

    it('should not have device before initialization', () => {
      const helix = new TinyHelix();
      expect(helix.device).toBeNull();
    });

    it('should destroy cleanly', () => {
      const helix = new TinyHelix();
      expect(() => helix.destroy()).not.toThrow();
      expect(helix.initialized).toBe(false);
    });
  });
});

describe('WebGPUContext', () => {
  it('should check if WebGPU is supported', () => {
    expect(WebGPUContext.isSupported()).toBe(false);
  });

  it('should create a new instance', () => {
    const context = new WebGPUContext();
    expect(context).toBeInstanceOf(WebGPUContext);
    expect(context.adapter).toBeNull();
    expect(context.device).toBeNull();
    expect(context.context).toBeNull();
  });

  it('should throw when initializing without WebGPU support', async () => {
    const context = new WebGPUContext();
    await expect(context.initialize()).rejects.toThrow('WebGPU is not supported');
  });
});
