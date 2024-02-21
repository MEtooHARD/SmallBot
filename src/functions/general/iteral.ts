function range(start: number, end: number) {
    let i = start;
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            return i <= end ?
                { value: i++, done: false }
                :
                { value: undefined, done: true }
        }
    }
}

export {
    range
}