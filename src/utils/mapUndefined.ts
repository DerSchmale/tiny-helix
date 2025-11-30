/**
 * Maps undefined values to undefined and non-undefined values to the result of fn. Similar to Rust's `Option<T>::map`.
 * @param value The value to map.
 * @param fn The mapping function.
 */
export function mapUndefined<T, U>(value: T | undefined, fn: (val: T) => U): U | undefined {
    if (value === undefined) {
        return undefined;
    }
    return fn(value);
}