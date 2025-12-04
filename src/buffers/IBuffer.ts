import {Buffer} from "./Buffer";

/**
 * Minimal buffer interface used by code that accept a buffer-like object.
 * Implementations must provide access to the underlying `Buffer` instance via
 * `_getBuffer()` so the runtime code can access the GPUBuffer for bind groups.
 */
export interface IBuffer {
    _getBuffer(): Buffer
}