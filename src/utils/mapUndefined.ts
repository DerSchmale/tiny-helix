/**
 * Maps undefined values to undefined and non-undefined values to the result of fn. Similar to Rust's `Option<T>::map`.
 * @param value
 * @param fn
 */
export function mapUndefined<T, U>(value: T | undefined, fn: (val: T) => U): U | undefined {
    if (value === undefined) {
        return undefined;
    }
    return fn(value);
}