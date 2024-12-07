
export class Manager<T extends any> {
    protected items: Map<string, T>;

    constructor(items?: [string, T][]) {
        this.items = new Map<string, T>(items);
    }

    has(key: string): boolean { return this.items.has(key); };

    get(key: string): T | undefined { return this.items.get(key); };

    set(key: string, val: T) { this.items.set(key, val); };

    del(key: string) { this.items.delete(key); };

    keys(): IterableIterator<string> { return this.items.keys(); };

    values(): IterableIterator<T> { return this.items.values(); }

    size(): number { return this.items.size; };
}
