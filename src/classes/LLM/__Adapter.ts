import { UniLLM } from "./__Types";
import { FetchProxy } from "./Keyring";

export abstract class Adapter {
    abstract readonly Provider: string;

    abstract readonly model_info: {
        readonly Name: string;
    }

    protected constructor() { }

    abstract post(
        fetch: FetchProxy,
        req: UniLLM.ChatRequest & { stream: true }
    ): Promise<UniLLM.StreamResponse>;
    abstract post(
        fetch: FetchProxy,
        req: UniLLM.ChatRequest & { stream?: false }
    ): Promise<UniLLM.NonStreamResponse>;
    abstract post(
        fetch: FetchProxy,
        req: UniLLM.ChatRequest
    ): Promise<UniLLM.Response>;
}