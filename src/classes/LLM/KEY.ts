export interface IKEY {
    readonly name: string;
    readonly provider: string;
    readonly key: string;
    status: 'ok' | 'ratelimited';
    useFetch<BODY extends any = any>(
        url: string,
        method: string,
        authOptionName?: string,
        authPrefix?: string,
        headers?: Record<string, string>,
        body?: BODY
    ): Promise<any>;
}

class KEY implements IKEY {
    private _inuse: boolean = false;
    private _status: 'ok' | 'ratelimited';

    constructor(
        public readonly name: string,
        public readonly provider: string,
        public readonly key: string,
    ) {
        this._status = 'ok';
    }

    useFetch(
        url: string,
        method: string,
        authOptionName: string = 'authorization',
        authPrefix: string = 'Bearer ',
        headers: Record<string, string> = {},
        body?: any
    ): Promise<any> {
        return fetch(url, {
            method,
            headers: {
                [authOptionName]: authPrefix + this.key,
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    get status(): 'ok' | 'ratelimited' {
        return this._status;
    }

    set status(value: 'ok' | 'ratelimited') {
        this._status = value;
    }
}

export type KEYType = InstanceType<typeof KEY>;

export class Keyring {
    private _keys: Map<string, KEY> = new Map();
    private _tokens: Set<string> = new Set();

    constructor() { }

    createKey(provider: string, name: string, key: string): KEY {
        if (this.getKey(provider, name))
            throw new Error(`Key with name ${name} for provider ${provider} already exists.`);
        if (this._tokens.has(key))
            throw new Error(`Key with value ${key} already exists.`);

        const Key = new KEY(name, provider, key);
        this._keys.set(Key.name + '@' + Key.provider, Key);
        this._tokens.add(key);
        return Key;
    }

    getKey(provider: string, name?: string): KEY | null {
        if (name) {
            const token = name + '@' + provider;
            return this._keys.get(token) || null;
        } else {
            for (const key of this._keys.values())
                if (key.provider === provider && key.status === 'ok')
                    return key;
            return null;
        }
    }

    listKeysOf(provider: string): Iterator<KEY> {
        return this._keys.values()
            .filter(k => k.provider === provider);
    }

    markRateLimited(key: KEY, time_ms: number): void {
        key.status = 'ratelimited';
        setTimeout(() => {
            key.status = 'ok';
        }, time_ms);
    }
}