import { Snowflake } from "discord.js";
import { ULLM } from "./__Types";
import config from '../../config.json';
import { v4 } from 'uuid';

export enum KEY_STATUS { GOOD, IN_USE, RATE_LIMITED, SUSPENDED }

export type RequestRecord = {
    lessee_id: Snowflake;
    timestamp: number;
    // status: 'success' | 'failure';
    // statusCode: number;
    // latency: number; // ms
}

type Key<P extends string = string> = {
    key_str: string;
    provider: P;
    status: KEY_STATUS.GOOD | KEY_STATUS.RATE_LIMITED | KEY_STATUS.SUSPENDED;
    current_lessee: null;
    readonly request_history: ReadonlyArray<RequestRecord>;
} | {
    key_str: string;
    provider: P;
    status: KEY_STATUS.IN_USE;
    current_lessee: Snowflake;
    readonly request_history: ReadonlyArray<RequestRecord>;
}

type KeyPool<P extends string = string> = { [provider in P]: Set<Key>; }

type ReadonlyKeyPool<P extends string = string> = { readonly [provider in P]: ReadonlySet<Key>; }

export class Handle<P extends string = string> {
    constructor(
        readonly token: string,
        readonly provider: P
    ) { }

    release(key: Key<P>, lessee_id: Snowflake): void { }
}

class Keyring<P extends string = string> {
    protected readonly providers: ReadonlyKeyPool<P>;
    protected token_key_map = new Map

    constructor(
        keys: { [provider in P]: Set<string> }
    ) {
        const tempKeyPool = {} as KeyPool<P>;
        const keyStrings = new Set<string>();

        for (const prov in keys) {
            tempKeyPool[prov] = new Set<Key<P>>();
            for (const keyStr of keys[prov]) {
                if (keyStrings.has(keyStr))
                    throw new Error(`Duplicate key detected: ${keyStr}`);
                keyStrings.add(keyStr);
                tempKeyPool[prov].add({
                    key_str: keyStr,
                    provider: prov,
                    status: KEY_STATUS.GOOD,
                    current_lessee: null,
                    request_history: []
                });
            }
        }
        this.providers = tempKeyPool;
    }

    leaseKey(provider: P, lessee_id: Snowflake): Key | null {
        const availableKeys = this.providers[provider].values()
            .filter(k => k.status === KEY_STATUS.GOOD)
            .toArray();

        // same last lessee first
        const lastUsedByLessee = availableKeys.find(k =>
            k.request_history.length > 0 &&
            k.request_history[k.request_history.length - 1].lessee_id === lessee_id
        );
        if (lastUsedByLessee) return lastUsedByLessee;

        // or the least frequently used key
        return availableKeys.sort((a, b) => a.request_history.length - b.request_history.length)[0] || null;
    }
}

export const LLMKeyring = new Keyring<ULLM.Providers>({
    google: new Set(config.models.gemini.keys.map(k => k)),
    xai: new Set(config.models.grok.keys.map(k => k))
});