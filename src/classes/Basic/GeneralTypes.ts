export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
};

export interface NestedArray<T> extends Array<T | NestedArray<T>> { };


export type Success<T> = [T, null];
export type Failure<E> = [null, E];
export type ExtraMessage = string[];
export type Result<T, E = Error> = Success<T> | Failure<E>;

export type Result_<T, E> = [true, T] | [false, E];

export async function tryCatch<T, E = Error>(
    promise: Promise<T>,
): Promise<Result_<T, E>> {
    try {
        const result = await promise;
        return [true, result];
    } catch (e) {
        return [false, e as E];
    }
}

export type AnyFunction = (...args: any[]) => any;