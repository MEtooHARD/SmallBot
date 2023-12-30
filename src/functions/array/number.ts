

const range = ({ start = 0, end = 0 }): Array<number> => {
    if (start <= end) return Array.from(Array(end - start + 1).keys()).map(x => x + start);
    try {
        new Array(end - start);
    } catch (e) {
        console.error(e);
    }
    return [];
}

export { range };