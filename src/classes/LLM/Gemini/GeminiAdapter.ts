import { Adapter } from "../__Adapter";
import { UniLLM } from "../__Types";
import { FetchProxy } from "../Keyring";


abstract class GeminiAdapter extends Adapter implements Adapter {
    Provider: string = 'google';
    abstract override readonly model_info: GeminiModelInfo;
    post(fetch: FetchProxy, req: UniLLM.ChatRequest & { stream: true; }): Promise<UniLLM.StreamResponse>;
    post(fetch: FetchProxy, req: UniLLM.ChatRequest & { stream?: false; }): Promise<UniLLM.NonStreamResponse>;
    post(fetch: FetchProxy, req: UniLLM.ChatRequest): Promise<UniLLM.Response>;
    post(fetch: unknown, req: unknown): Promise<UniLLM.Response> | Promise<UniLLM.StreamResponse> | Promise<UniLLM.NonStreamResponse> {
        throw new Error("Method not implemented.");
    }

}

// class Gemini3 extends GeminiAdapter { readonly model_info: GeminiModelInfo;}

export class Gemini {
    private constructor() { }
}

export interface GeminiModelInfo {
    readonly Name: string;
}