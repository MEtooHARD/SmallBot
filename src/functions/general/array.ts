import { randomInt } from "./number";

/**
 * - Randomly pick one or more elements from an array (and cut them from the array).
 * - By passing `cut` as true, the result won't be duplicate and the picked elements will be removed from the source array.
 * - If you don't want the picked element to be duplicate without cutting your source array, put a copy of the source array instead.
 * @param source The source array.
 * @param count How many you want to pick. default `1`
 * @param cut Whether to cut the chosen ones. default `false`
 * @return An array containing the picked elements.
 */
const randomPick = (source: any[], count: number = 1, cut: boolean = false): any[] => {
    if (count <= 0) return [];
    const result: any[] = [];
    let randomN: number;
    for (let i = 0; i < count; i++) {
        randomN = randomInt(0, source.length - 1);
        result.push(source[randomN]);
        if (cut) source.splice(randomN, 1);
    }
    return result;
}

export {
    randomPick
}