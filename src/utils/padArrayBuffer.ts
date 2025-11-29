export function padArrayBuffer(input: ArrayBuffer | SharedArrayBuffer, alignment: number): ArrayBuffer | SharedArrayBuffer
{
    const targetSize = Math.ceil(input.byteLength / alignment) * alignment;
    if (targetSize === input.byteLength) return input;
    const data = input instanceof ArrayBuffer? new ArrayBuffer(targetSize) : new SharedArrayBuffer(targetSize);
    const src = new Uint8Array(input);
    const dst = new Uint8Array(data);
    dst.set(src);
    return data;
}