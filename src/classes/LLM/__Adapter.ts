import { ULLMTypes } from "./__Types";
import { KEYType } from "./KEY";



export abstract class Adapter {
    abstract readonly model_info: {
        readonly Name: string;
    }

    protected constructor() { }

    abstract post(req: ULLMTypes.ChatRequest): Promise<ULLMTypes.Response>;
}