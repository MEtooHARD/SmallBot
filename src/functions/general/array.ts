import { randomInt } from "./number";

/**
 * - Randomly pick one or more elements from an array (and cut them from the array).
 * - By passing `cut` as true, the result won't be duplicate and the picked elements will be removed from the source array.
 * - If you don't want the picked element to be duplicate without cutting your source array, put a copy of the source array instead.
 * @param source The source array.
 * @param count How many you want to pick. default `1`
 * @param cut Whether to remove the chosen ones. default `false`
 * @return An array containing the picked elements.
 */
export const randomPick = <T>(source: T[], count: number = 1, cut: boolean = false): T[] => {
    if (source.length == 0) {
        console.log('warning: random pick encounterred empty array.')
        return [];
    }
    if (count <= 0) return [];
    const result: T[] = [];
    let randomN: number;
    for (let i = 0; i < count; i++) {
        randomN = randomInt(0, source.length - 1);
        result.push(source[randomN]);
        if (cut) source.splice(randomN, 1);
    }
    return result;
}

export const splitArray = <T>(arr: T[], size: number): T[][] => Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size));


export const overlap = <T>(arr1: T[], arr2: T[]) => arr1.some(item => arr2.includes(item));

/**
 * Removes `element` from `arr` if it presents.
 * @param arr 
 * @param element 
 * @returns `true` if removed, `false` if not removed.
 */
export const removeElement = <T>(arr: T[], element: T): boolean => {
    let i = arr.indexOf(element);
    if (i !== -1) {
        arr.splice(i, 1);
        return true;
    }
    return false
};
/**
 * Removes `elements` from `arr` according to each single state of presenting.
 * @param arr 
 * @param elements 
 * @returns Amount Removed.
 */
export const removeElements = <T>(arr: T[], elements: T[]): number => {
    if (elements.length)
        return Number(removeElement(arr, elements.splice(0, 1)[0])) + removeElements(arr, elements);
    return 0;
};

/**
 * Adds `element` to `arr` if not duplicated.
 * @param arr 
 * @param element 
 * @returns `true` if added, `false` if not added.
 */
export const addElement = <T>(arr: T[], element: T): boolean => {
    if (arr.includes(element))
        return false;
    arr.push(element);
    return true;
};
/**
 * Adds `elements` to `arr` according to each single state of presenting.
 * @param arr 
 * @param elements 
 * @returns The amount added.
 */
export const addElements = <T>(arr: T[], elements: T[]): number => {
    if (elements.length)
        return Number(addElement(arr, elements.splice(0, 1)[0])) + addElements(arr, elements);
    return 0;
};

export class PosRange implements Iterator<number> {
    private _value: number;
    private _range: number;
    private _volume: number;

    constructor(range: number, volume: number = 1, from: number = 0) {
        this._value = from - volume;
        this._range = range;
        this._volume = volume;
    };

    next(): IteratorResult<number> {
        this._value += this._volume;
        return {
            value: this._value,
            done: this._value > this._range
        };
    };

    [Symbol.iterator]() { return this; };
};


export function biSplitArray<T>
    (arr: T[], splitBy: (element: T) => boolean)
    : [Y: T[], X: T[]] {
    const Y: T[] = [], X: T[] = [];
    arr.forEach(ele => {
        if (splitBy(ele)) Y.push(ele);
        else X.push(ele);
    })

    return [Y, X];
}

export function groupElements<T>
    (arr: T[], genKey: (ele: T) => Iterable<string>)
    : [string, T[]][] {
    const map = new Map<string, T[]>();

    for (const obj of arr)
        for (const key of genKey(obj)) {
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(obj);
        }

    return [...map.entries()];
}

/**
 * Groups elements into maximal subarrays satisfying the provided condition.
 * Singleton elements failing the condition are included as groups unless `includeInvalidSingleton` is `false`.
 * The condition receives the current group, next element, and a group-scoped memo for optimization.
 * 
 * @param arr Input array of elements to group.
 * @param condition Determines if adding the next element is valid, returning [isValid, updatedMemo].
 * @param includeInvalidSingleton If `false`, excludes invalid singletons; defaults to `true`.
 * @returns Array of grouped elements, each satisfying the condition or a singleton if allowed.
 */
export function adaptiveGroup<T, M>(
    arr: T[],
    condition: (eles: T[], nextEle: T, memo: M | undefined) => [boolean, M | undefined],
    includeInvalidSingleton: boolean = true
): T[][] {
    let index = 0;
    let groups: T[][] = [];

    while (index < arr.length) {
        let group: T[] = [];
        let memo: M | undefined = undefined;

        while (index < arr.length) {
            const [valid, nextMemo] = condition(group, arr[index], memo);
            memo = nextMemo;
            if (valid) group.push(arr[index++]);
            else break;
        }

        if (group.length > 0)   // normal group
            groups.push(group);
        else {                  // singleton
            if (includeInvalidSingleton)
                groups.push([arr[index]]);
            index++;
        }
    }
    return groups;
}