

const range = ({ start = 0, end = 0 }): Array<number> => {
    if (start <= end) return new Array(end - start).map(x => x + start);
    try {
        new Array(end - start);
    } catch(e) {
        console.error(e);
    }
    return [];
}

export {range};