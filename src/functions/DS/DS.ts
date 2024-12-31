


class Queue<T> {
    private items: T[] = [];
    private head: number = 0;

    constructor() { }

    enqueue(...item: T[]): number { return this.items.push(...item); }

    dequeue(): T {
        if (this.empty()) throw new Error("Queue is empty");

        const item = this.items[this.head++];

        if (this.size() > 100) {
            this.items = this.items.slice(this.head);
            this.head = 0;
        }
        return item;
    }

    top(): T {
        if (this.empty()) throw new Error("Queue is empty");
        return this.items[this.head];
    }

    empty() { return this.head >= this.items.length; }

    size() { return this.items.length - this.head; }
}