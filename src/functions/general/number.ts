

/**
 * get the ordinal number
 * @param number 
 * @returns corresponding ordinal number
 */
export const ordinal = (number: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = number % 100;
  return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export const range = (start = 0, end = 0): Array<number> => {
  if (start < end) return Array.from(Array(end - start + 1).keys()).map(x => x + start);
  if (start === end) return [];
  return Array.from(Array(start - end + 1).keys()).reverse().map(x => x + end);
}

export const restrictRange = (num: number, lowLimit: number, highLimit: number) => {
  return ((num < lowLimit) ? lowLimit : ((num > highLimit) ? highLimit : num));
}

/**
 * returns a randome number that is [low, high). if low > high, this function will swap them and log a warning message.
 * @param low the lower limit
 * @param high the higher limit
 * @returns a float number that [low, high).
 */
export const randomNumberRange = (low: number, high: number): number => {
  if (low > high) {
    [low, high] = [high, low]
    console.log('warning: low is higher than high');
  };
  return Math.random() * (high - low) + low;
}

/**
 * returns an interger that is [low, high] 
 * @param low the lower limit
 * @param high the higher limit
 * @returns an interger number.
 */
export const randomInt = (low: number, high: number): number => {
  if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error('must use integers');
  return Math.round(randomNumberRange(low, high));
}

/**
 * See whether come true by given percentage
 * @param percentage 
 * @returns 
 */
export const byChance = (percentage: number): boolean => {
  return (randomNumberRange(0, 100) < percentage);
}

export const a_b_percent = (a: number, b: number, precision: number = 2) => {
  const factor = Math.pow(10, precision), sum = a + b;
  a = Math.round(a / sum * 100 * factor) / factor;
  b = Math.round(b / sum * 100 * factor) / factor;

  let discrepancy = 100 - (a + b);

  let B = b + discrepancy;

  return [a.toFixed(precision), B.toFixed(precision)];
};
