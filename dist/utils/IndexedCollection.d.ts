export interface IndexedCollection extends Iterable<number> {
    readonly length: number;
    [index: number]: number;
}
