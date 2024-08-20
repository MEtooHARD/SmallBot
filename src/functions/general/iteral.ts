

export function range(range: number, start: number = 0): IterableIterator<number> {
    let i = start;
    range--;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            return i <= range
                ? { value: i++, done: false }
                : { value: i, done: true };
        }
    };
};