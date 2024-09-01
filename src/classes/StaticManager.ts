export class StaticManager<V extends any> {
    protected readonly items: Map<string, V>;

    constructor(items: [string, V][]) {
        this.items = new Map<string, V>(items);
    }

    has(key: string): boolean { return this.items.has(key); };

    get(key: string): V | undefined { return this.items.get(key); };

    keys(): IterableIterator<string> { return this.items.keys(); };

    values(): IterableIterator<V> { return this.items.values(); }

    amount(): number { return this.items.size; };
};