import { Snowflake } from "discord.js";
import { v4 } from 'uuid';
import config from '../../config.json';
import { ULLM } from "./__Types";

export enum KEY_STATUS { READY, IN_USE, RATE_LIMITED, SUSPENDED }

export type FetchProxy = (url: string, init?: RequestInit) => Promise<any>;

export type RequestRecord = {
    lessee_id: Snowflake;
    timestamp: number;
    // status: 'success' | 'failure';
    // statusCode: number;
    // latency: number; // ms
}

type Key<P extends string = string> = {
    readonly key_str: string;
    readonly provider: P;
    status: KEY_STATUS;
    current_lessee: Snowflake | null;
    request_history: RequestRecord[];
}

type KeyPool<P extends string = string> = { [provider in P]: Set<Key>; }

export class Token<P extends string = string> {

    constructor(
        readonly str: string,
        readonly provider: P,
        readonly keyring: Keyring<P>,
        readonly useFetch: FetchProxy
    ) { }
    /** convenience method to call keyring.release() */
    release(): void { this.keyring.release(this); }
    /** convenience method to call keyring.useFetch() */
    // useFetch(): FetchProxy | null { return this.keyring.useFetch(this); }

}

class Keyring<P extends string = string> {
    protected readonly providers: KeyPool<P>;
    protected readonly token_key_map: Map<string, Key<P>>;

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
                    status: KEY_STATUS.READY,
                    current_lessee: null,
                    request_history: []
                });
            }
        }
        this.providers = tempKeyPool;
        this.token_key_map = new Map<string, Key<P>>();
    }
    // /**
    //  * returns a function that performs fetch with the token's key in the Authorization header
    //  * 
    //  * returns null if the token is invalid
    //  * @param token 
    //  * @param url 
    //  * @param init 
    //  * @returns 
    //  */
    // useFetch(token: Token<P>): FetchProxy | null {
    //     const key = this.token_key_map.get(token.str);
    //     if (!key) return null;

    //     return (url: string, init?: RequestInit) => fetch(url, {
    //         ...init,
    //         headers: {
    //             ...init?.headers,
    //             'Authorization': `Bearer ${key.key_str}`
    //         }
    //     });
    // }

    acquire(provider: P, lessee_id: Snowflake): Token<P> | null {
        const key = this.getProperKey(provider, lessee_id);
        if (!key) return null;

        key.status = KEY_STATUS.IN_USE;
        key.current_lessee = lessee_id;
        key.request_history.push({ lessee_id, timestamp: Date.now() });

        const new_token = new Token(v4(), provider, this,
            (url: string, init?: RequestInit) => fetch(url, {
                ...init,
                headers: {
                    ...init?.headers,
                    'Authorization': `Bearer ${key.key_str}`
                }
            }));
        this.token_key_map.set(new_token.str, key);
        return new_token;
    }

    release(token: Token<P>): void {
        const key = this.token_key_map.get(token.str);
        if (!key) return;
        this.token_key_map.delete(token.str);
        key.status = KEY_STATUS.READY;
        key.current_lessee = null;
    }

    private getProperKey(provider: P, lessee_id: Snowflake): Key<P> | null {
        const availableKeys = this.providers[provider].values()
            .filter(k => k.status === KEY_STATUS.READY)
            .toArray() as Key<P>[];

        // same last lessee first or the least frequently used key
        return availableKeys.find(k => k.request_history.length > 0 && k.request_history[k.request_history.length - 1].lessee_id === lessee_id)
            || availableKeys.sort((a, b) => a.request_history.length - b.request_history.length)[0]
            || null;
    }
}

export const LLMKeyring = new Keyring<ULLM.Providers>({
    // google: new Set(config.models.gemini.keys.map(k => k)),
    xai: new Set(config.models.grok.keys.map(k => k))
});