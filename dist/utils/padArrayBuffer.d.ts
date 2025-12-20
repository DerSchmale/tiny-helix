/**
 * Pad an ArrayBuffer (or SharedArrayBuffer) to the given alignment in bytes.
 * If the input is already aligned, the original buffer is returned. Otherwise a
 * new buffer is allocated, the contents copied, and the new buffer returned.
 *
 * @param input - The input ArrayBuffer or SharedArrayBuffer to pad
 * @param alignment - Desired byte alignment (e.g. 4 for 32-bit alignment)
 * @returns A buffer with byteLength rounded up to the nearest multiple of alignment
 */
export declare function padArrayBuffer(input: ArrayBuffer | SharedArrayBuffer, alignment: number): ArrayBuffer | SharedArrayBuffer;
