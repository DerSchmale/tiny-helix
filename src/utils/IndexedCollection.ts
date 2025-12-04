// doing the same thing as gl-matrix
export interface IndexedCollection extends Iterable<number> {
    readonly length: number;
    [index: number]: number;
}