/**
 * Pad an ArrayBuffer (or SharedArrayBuffer) to the given alignment in bytes.
 * If the input is already aligned, the original buffer is returned. Otherwise a
 * new buffer is allocated, the contents copied, and the new buffer returned.
 *
 * @param input - The input ArrayBuffer or SharedArrayBuffer to pad
 * @param alignment - Desired byte alignment (e.g. 4 for 32-bit alignment)
 * @returns A buffer with byteLength rounded up to the nearest multiple of alignment
 */
export function padArrayBuffer(input: ArrayBuffer | SharedArrayBuffer, alignment: number): ArrayBuffer | SharedArrayBuffer {
    const targetSize = Math.ceil(input.byteLength / alignment) * alignment;
    if (targetSize === input.byteLength) return input;
    const data = input instanceof ArrayBuffer ? new ArrayBuffer(targetSize) : new SharedArrayBuffer(targetSize);
    const src = new Uint8Array(input);
    const dst = new Uint8Array(data);
    dst.set(src);
    return data;
}