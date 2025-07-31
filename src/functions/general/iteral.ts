
export function range(amount: number, start: number = 0): IterableIterator<number> {
    const alt = amount > 0 ? 1 : -1;
    let count = -alt;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            count += alt;
            if (count !== amount) return { value: start + count, done: false };
            else return { value: undefined, done: true };
        }
    };
};
