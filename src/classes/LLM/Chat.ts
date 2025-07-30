import { GrokModelInfo } from "./types";
import { GrokModel, GrokModels } from "./Wrapper";

const Grok_4 = new GrokModel(GrokModels.Grok_4_0709);

export class Chat {

    private status: Chat.Status;
    // private temperature: number;
    // private p_top: number;
    readonly llm: GrokModel<GrokModelInfo>;

    constructor() {
        this.status = Chat.Status.IDLE;
        // this.temperature = 1.3;
        // this.p_top = 0.9;
        this.llm = Grok_4;
    }

    onMessage(message: string): void {

    }
}

export namespace Chat {
    export enum Status {
        IDLE = 'idle',
        THINKING = 'thinking',
    }
}