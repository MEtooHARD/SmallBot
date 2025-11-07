import { ULLM } from "./__Types";
import { FetchProxy } from "./Keyring";

export abstract class Adapter {
    abstract readonly Provider: string;

    abstract readonly model_info: {
        readonly Name: string;
    }

    protected constructor() { }

    abstract post(
        fetch: FetchProxy,
        req: ULLM.ChatRequest & { stream: true }
    ): Promise<ULLM.StreamResponse>;
    abstract post(
        fetch: FetchProxy,
        req: ULLM.ChatRequest & { stream?: false }
    ): Promise<ULLM.NonStreamResponse>;
    abstract post(
        fetch: FetchProxy,
        req: ULLM.ChatRequest
    ): Promise<ULLM.Response>;
}