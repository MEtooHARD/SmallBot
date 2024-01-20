

const randomNumberRange = (low, high) => {
    if (low === high) throw new Error('low and high cannnot be equal.');
    if (low > high) [low, high] = [high, low];
    return Math.random() * (high - low) + low;
}

const randomInt = (low, high) => {
    if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error('must use integers');
    return Math.round(randomNumberRange(low, high));
}

const randomPick = (source, count = 1, cut = false) => {
    const result = [];
    let randomN;
    for (let i = 0; i < count; i++) {
        randomN = randomInt(0, source.length - 1);
        result.push(source[randomN]);
        if (cut) source.splice(randomN, 1);
    }
    return result;
}

const arr = [1, 2, 3, 4, 5, 6, 7];

console.log(randomPick(arr, 5, true));
console.log(arr)