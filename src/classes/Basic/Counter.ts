export class Counter {
    protected _count: number;
    protected _base: number;

    constructor(base: number = 0) {
        this._count = base;
        this._base = base;
    };

    get base(): number { return this._base; }
    get count(): number { return this._count; }

    protected set count(n: number) { this._count = n; }

    increment(n?: number): this {
        this.count = this.count + (n ?? 1);
        return this;
    };

    decrement(n?: number): this {
        this.count = this.count - (n ?? 1);
        return this;
    };
};
