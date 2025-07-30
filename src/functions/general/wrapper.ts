import { Result } from "../../classes/Basic/GeneralTypes";

export async function tryCatch<T = any, E extends Error = Error>(promise: Promise<T>): Promise<Result<T>> {
    try {
        const result = await promise;
        return [result, null];
    } catch (error) {
        return [null, error as E];
    }
}