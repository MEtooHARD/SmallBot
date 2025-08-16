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
): Promise<Result<T, E>> {
    try {
        const result = await promise;
        return [result, null];
    } catch (e) {
        return [null, e as E];
    }
}

export async function tryCatch_flat<T>(
    promise: Promise<Result<T>>,
): Promise<Result<T>> {
    try {
        const result = await promise;
        return result;
    } catch (e) {
        return [null, e as any];
    }
}

export async function suppress(promise: Promise<any>): Promise<void> {
    try { await promise; } catch (e) { }
}

export type AnyFunction = (...args: any[]) => any;

export type ChannelLocation = {
    guildID: string;
    channelID: string;
}