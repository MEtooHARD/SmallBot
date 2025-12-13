import { UniLLM } from "../__Types";

export interface GeminiModelInfo {
    readonly Name: string;
    readonly Aliases: readonly string[];

    readonly Modalities: {
        readonly TextInput: boolean,
        readonly ImageInput: boolean,
        readonly AudioInput: boolean,
        readonly VideoInput: boolean,
        readonly TextOutput: boolean,
    }
    readonly Capabilities: {
        readonly FunctionCalling: boolean,
        readonly CodeExecution: boolean,
    }
    readonly RateLimits: {
        readonly request: UniLLM.RPM<number> | UniLLM.RPS<number> | null,
        readonly token: UniLLM.TPM<number> | null
    };

    readonly Pricing: UniLLM.Pricing | null; // TODO: Fill in pricing details
    readonly Context: number;
}

export const gemini_1_5_pro_info: GeminiModelInfo = {
    Name: 'gemini-1.5-pro-latest',
    Aliases: ['1.5-pro'],
    Modalities: {
        TextInput: true,
        ImageInput: true,
        AudioInput: true,
        VideoInput: true,
        TextOutput: true,
    },
    Capabilities: {
        FunctionCalling: true,
        CodeExecution: true,
    },
    RateLimits: { // TODO: check actual rate limits
        request: null,
        token: null,
    },
    Pricing: null, // TODO: fill in pricing details
    Context: 1_000_000,
};
