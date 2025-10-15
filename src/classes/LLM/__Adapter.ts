import { ULLM } from "./__Types";

export abstract class Adapter {
    abstract readonly model_info: {
        readonly Name: string;
    }

    protected constructor() { }

    abstract post(req: ULLM.ChatRequest): Promise<ULLM.Response>;
}