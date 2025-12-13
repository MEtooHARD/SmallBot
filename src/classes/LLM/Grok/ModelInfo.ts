import { UniLLM } from "../__Types";
import { GrokModelInfo } from "./GrokAdapter";

export const grok_4_info: GrokModelInfo = {
    Name: 'grok-4-0709',
    Aliases: ['grok-4', 'grok-4-latest'],
    Modalities: { TextInput: true, ImageInput: true, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: UniLLM.RPM(480), token: UniLLM.TPM(2_000_000) },
    Pricing: { input: 3 / 1_000_000, cached: 0.75 / 1_000_000, output: 15 / 1_000_000 },
    HighPricing: { input: 6 / 1_000_000, output: 30 / 1_000_000 },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 256_000,

    ReasoningOnlyModel: true,
    ReasoningContent: false,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;

export const grok_4_1_fast_reasoning_info: GrokModelInfo = {
    Name: 'grok-4-1-fast-reasoning',
    Aliases: ['grok-4-1-fast', 'grok-4-1-fast-reasoning-latest'],
    Modalities: { TextInput: true, ImageInput: true, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: UniLLM.RPM(480), token: UniLLM.TPM(4_000_000) },
    Pricing: { input: 0.2 / 1_000_000, cached: 0.05 / 1_000_000, output: 0.5 / 1_000_000 },
    HighPricing: { input: 0.4 / 1_000_000, output: 1 / 1_000_000 },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 2_000_000,

    ReasoningOnlyModel: true,
    ReasoningContent: true,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;

export const grok_4_fast_reasoning_info: GrokModelInfo = {
    Name: 'grok-4-fast-reasoning',
    Aliases: ['grok-4-fast', 'grok-4-fast-reasoning-latest'],
    Modalities: { TextInput: true, ImageInput: true, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: UniLLM.RPM(480), token: UniLLM.TPM(4_000_000) },
    Pricing: { input: 0.2 / 1_000_000, cached: 0.05 / 1_000_000, output: 0.5 / 1_000_000 },
    HighPricing: { input: 0.4 / 1_000_000, output: 1 / 1_000_000 },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 2_000_000,

    ReasoningOnlyModel: true,
    ReasoningContent: true,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;

export const grok_3_mini_info: GrokModelInfo = {
    Name: 'grok-3-mini',
    Aliases: [
        'grok-3-mini-latest',
        'grok-3-mini-beta',
        'grok-3-mini-fast',
        'grok-3-mini-fast-latest',
        'grok-3-mini-fast-beta'
    ],
    Modalities: { TextInput: true, ImageInput: false, TextOutput: true, ImageOutput: false },
    Capabilities: { FunctionCalling: true, StructuredOutput: true, Reasoning: true },
    RateLimits: { request: UniLLM.RPM(480), token: UniLLM.TPM(Infinity) },
    Pricing: { input: 0.3 / 1_000_000, cached: 0.075 / 1_000_000, output: 0.5 / 1_000_000 },
    HighPricing: {},
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: Infinity,
    Context: 131_072,

    ReasoningOnlyModel: true,
    ReasoningContent: true,
    ReasoningEffort: true
}