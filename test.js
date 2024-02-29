const range = (start, end) => {
    if (start < end) return Array.from(Array(end - start + 1).keys()).map(x => x + start);
    if (start === end) return [];
    return Array.from(Array(start - end + 1).keys())/*.reverse() .map(x => x + end) */;
}

console.log(range(4, 0))