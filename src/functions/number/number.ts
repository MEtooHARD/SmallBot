const restrictRange = (num: number, lowLimit: number, highLimit: number) => {
    return ((num < lowLimit) ? lowLimit : ((num > highLimit) ? highLimit : num));
}

export {
    restrictRange
}