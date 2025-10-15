import { ULLM } from "../__Types";
import { GrokModelInfo } from "./GrokAdapter";

export const Grok_4_info: GrokModelInfo = {
    Name: 'grok-4-0709',
    Aliases: ['grok-4', 'grok-4-latest'],
    Modalities: { TextInput: true, ImageInput: true, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: ULLM.RPM(480), token: ULLM.TPM(2_000_000) },
    Pricing: { input: 3 / 1_000_000, cached: 0.75 / 1_000_000, output: 15 / 1_000_000 },
    HighPricing: { input: 6 / 1_000_000, output: 30 / 1_000_000 },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 256_000,

    ReasoningOnlyModel: true,
    ReasoningContent: false,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;