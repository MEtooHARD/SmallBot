import { Result } from '../Basic/GeneralTypes';
import { GrokChatCompletion, GrokPostParams, GrokModelInfo, RateType, Pricing, LiveSearchPrice, Cost } from './types';
import { RateCounter } from '../RateCounter';

export class GrokModel<Model extends GrokModelInfo> {
    static readonly URL = 'https://api.x.ai/v1/chat/completions';

    readonly info: Model;
    readonly requestCounter: RateCounter | null = null;
    readonly tokenCounter: RateCounter | null = null;

    constructor(info: Model) {
        this.info = info;
        if (info.RateLimits.request)
            this.requestCounter = new RateCounter(4, 0.25,
                info.RateLimits.request.window === 60 ? 'min' : 'sec');
        if (info.RateLimits.token)
            this.tokenCounter = new RateCounter(4, 0.25, 'min');
    }

    async post(
        key: string,
        params: Omit<GrokPostParams<Model>, 'model'> & { stream: true }
    ): Promise<Result<Response>>;
    async post(
        key: string,
        params: Omit<GrokPostParams<Model>, 'model'> & { stream?: false }
    ): Promise<Result<GrokChatCompletion>>;
    async post(
        key: string,
        params: Omit<GrokPostParams<Model>, 'model'>
    ): Promise<Result<GrokChatCompletion | Response>> {
        try {
            const response = await fetch(GrokModel.URL, {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${key}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ ...params, model: this.info.Name }),
            });
            if (params.stream)
                // return [response.body as ReadableStream<string>, null];
                return [response, null];
            else
                return [(await response.json()) as GrokChatCompletion, null];
        } catch (e) {
            return [null, e as Error];
        }
    }

    static calcCost(
        info: GrokModelInfo,
        cost: Cost
    ): number {
        const prompt_tokens = cost.prompt_tokens;
        const cached_tokens = cost.cached_tokens;
        const break_point = info.HighInputPoint;
        const citations = cost.citations;

        const pricing: Pricing = info.Pricing;
        if (break_point && info.HighInputPoint && prompt_tokens + cached_tokens > break_point) {
            const hPricing = info.HighPricing;
            if (hPricing.input) pricing.input = hPricing.input;
            if (hPricing.output) pricing.output = hPricing.output;
            if (hPricing.cached) pricing.cached = hPricing.cached;
        }

        return citations * LiveSearchPrice +
            pricing.input * prompt_tokens +
            pricing.cached * cached_tokens +
            pricing.output * (cost.output_reasoning + cost.output_text);
    }

    static extractCost(
        usage: GrokChatCompletion['usage']
    ): Cost {
        return {
            prompt_tokens: usage.prompt_tokens,
            cached_tokens: usage.prompt_tokens_details.cached_tokens,
            citations: usage.num_sources_used || 0,
            output_reasoning: usage.completion_tokens_details.reasoning_tokens,
            output_text: usage.completion_tokens

        }
    }
}

const Grok_4_0709 = {
    Name: 'grok-4-0709',
    Aliases: ['grok-4', 'grok-4-latest'],
    Modalities: {
        TextInput: true,
        ImageInput: true
    },
    Capabilities: {
        FunctionCalling: true,
        StructuredOutput: true,
        Reasoning: true
    },
    RateLimits: {
        request: { limit: 480, type: RateType.Request, window: 60 },
        token: { limit: 2_000_000, type: RateType.Token, window: 60 }
    },
    Pricing: {
        input: 3 / 1_000_000,
        cached: 0.75 / 1_000_000,
        output: 15 / 1_000_000
    },
    HighPricing: {
        input: 6 / 1_000_000,
        output: 30 / 1_000_000
    },
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: 128_000,
    Context: 256_000,

    ReasoningModel: true,
    ReasoningContent: false,
    ReasoningEffort: false
} as const satisfies GrokModelInfo;

const Grok_3_mini = {
    Name: 'grok-3-mini',
    Aliases: ['grok-3-mini-latest', 'grok-3-mini-beta'],
    Modalities: {
        TextInput: true,
        ImageInput: false
    },
    Capabilities: {
        FunctionCalling: true,
        StructuredOutput: true,
        Reasoning: true
    },
    RateLimits: {
        request: { limit: 480, type: RateType.Request, window: 60 },
        token: null
    },
    Pricing: {
        input: 0.3 / 1_000_000,
        cached: 0.075 / 1_000_000,
        output: 0.5 / 1_000_000
    },
    HighPricing: {},
    LiveSearchPricing: 25 / 1_000,
    HighInputPoint: null,
    Context: 131_072,

    ReasoningModel: true,
    ReasoningContent: true,
    ReasoningEffort: true
} as const satisfies GrokModelInfo;

export const GrokModels = {
    Grok_4_0709: new GrokModel(Grok_4_0709),
    Grok_3_mini: new GrokModel(Grok_3_mini)
} as const;