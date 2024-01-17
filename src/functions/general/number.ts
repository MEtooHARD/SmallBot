

const range = ({ start = 0, end = 0 }): Array<number> => {
    if (start <= end) return Array.from(Array(end - start + 1).keys()).map(x => x + start);
    try {
        new Array(end - start);
    } catch (e) {
        console.error(e);
    }
    return [];
}

const restrictRange = (num: number, lowLimit: number, highLimit: number) => {
    return ((num < lowLimit) ? lowLimit : ((num > highLimit) ? highLimit : num));
}

const randomNumberRange = (low: number, high: number): number => {
    if (low === high) throw new Error('low and high cannnot be equal.');
    if (low > high) [low, high] = [high, low];
    return Math.random() * (high - low) + low;
}

const randomInt = (low: number, high: number): number => {
    if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error('must use integers');
    return Math.round(randomNumberRange(low, high));
}

/**
 * See whether come true by given percentage
 * @param percentage 
 * @returns 
 */
const byChance = (percentage: number): boolean => {
    return (randomNumberRange(0, 100) < percentage);
}


export {
    range,
    randomInt,
    randomNumberRange,
    restrictRange,
    byChance
};