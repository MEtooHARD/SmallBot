const randomNumber = (low, high) => {
    if (low === high) throw new Error('low and high cannot be equal.')
    if (low > high) [low, high] = [high, low];
    return Math.round(Math.random() * (high - low)) + low;
}

console.log(randomNumber(5, 5))