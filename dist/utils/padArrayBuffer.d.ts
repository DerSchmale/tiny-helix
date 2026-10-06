/**
 * Pad an ArrayBuffer (or SharedArrayBuffer) to the given alignment in bytes.
 * If the input is already aligned, the original buffer is returned. Otherwise a
 * new buffer is allocated, the contents copied, and the new buffer returned.
 *
 * @param input - The input ArrayBuffer or SharedArrayBuffer to pad
 * @param alignment - Desired byte alignment (e.g. 4 for 32-bit alignment)
 * @param offset - The offset in bytes from the start of the input buffer to begin copying from
 * @param size - The number of bytes to copy from the input buffer
 * @returns A buffer with byteLength rounded up to the nearest multiple of alignment
 */
export declare function padArrayBuffer(input: ArrayBuffer | SharedArrayBuffer, alignment: number, offset: number, size: number): ArrayBuffer | SharedArrayBuffer;
