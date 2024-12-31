
export class Counter {
    protected _count: number;
    protected _base: number;

    constructor(base: number = 0) {
        this._count = base;
        this._base = base;
    };

    get base(): number { return this._base; }
    get count(): number { return this._count; }

    // protected set count(n: number) { this._count = n; }

    /**
     * increase the count by n or 1 of n not provided
     * @param n the number to increase by
     * @returns the instance
     */
    increment(n?: number): this {
        this._count = this._count + (n ?? 1);
        return this;
    };
    /**
     * decrease the count by n or 1 if n not provided
     * @param n the number to decrease by
     * @returns the instance
     */
    decrement(n?: number): this {
        this._count = this._count - (n ?? 1);
        return this;
    };
    /**
     * reset the count to the base(initial) value
     * @returns the instance
     */
    reset(): this {
        this._count = this._base;
        return this;
    };
    /**
     * set the base value
     * @param n the base value
     * @returns the instance
     */
    setBase(n: number): this {
        this._base = n;
        return this;
    }
    /**
     * @returns the difference since initiated (differ from base)
     */
    difference(): number {
        return this._count - this._base;
    }
};

