import { ULLM } from "./__Types";
import { Adapter } from "./__Adapter";
import { Grok } from "./Grok/GrokAdapter";

export const AdapterProviders: { [key in ULLM.Providers]?: Adapter[] } = {
    xai: [
        Grok._4,
        Grok._4_fast_reasoning,
        Grok._3_mini
    ],
    // google: []
}

export const AdapterNameMapping: { [key: string]: Adapter }
    = Object.values(AdapterProviders)
        .flat()
        .reduce((acc, adapter) => {
            acc[adapter.model_info.Name] = adapter;
            return acc;
        }, {} as { [key: string]: Adapter });

export const ModelNameList: string[] = Object.keys(AdapterNameMapping);