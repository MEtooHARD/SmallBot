import { UniLLM } from "./__Types";
import { Adapter } from "./__Adapter";
import { Grok } from "./Grok/GrokAdapter";
import { Gemini } from "./Gemini/GeminiAdapter";

export const AdapterProviders: { [key in UniLLM.Providers]?: Adapter[] } = {
    xai: [
        Grok._4,
        Grok._4_fast_reasoning,
        Grok._3_mini,
        Grok._4_1_fast_reasoning
    ],
    google: [
        // Gemini
    ]
}

export const AdapterNameMapping: { [key: string]: Adapter }
    = Object.values(AdapterProviders)
        .flat()
        .reduce((acc, adapter) => {
            acc[adapter.model_info.Name] = adapter;
            return acc;
        }, {} as { [key: string]: Adapter });

export const ModelNameList: string[] = Object.keys(AdapterNameMapping);