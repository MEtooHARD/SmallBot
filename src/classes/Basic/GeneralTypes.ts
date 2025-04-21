export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
};

export interface NestedArray<T> extends Array<T | NestedArray<T>> { };

export type Result<T, E> = [true, T] | [false, E];

export async function tryCatch<T, E = Error>(
    promise: Promise<T>,
): Promise<Result<T, E>> {
    try {
        const result = await promise;
        return [true, result];
    } catch (e) {
        return [false, e as E];
    }
}

export type AnyFunction = (...args: any[]) => any;