/**
 * Convert a JavaScript number (float32) to IEEE 754 binary16 (float16) representation.
 * Returns the 16-bit unsigned integer bit pattern for the half-float.
 */
export function float32ToFloat16(value: number): number {
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