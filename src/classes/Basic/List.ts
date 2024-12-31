import { SLinkNode } from "./Node";

export class SLinkList<T> {
    private _size: number = 0;
    private _head: SLinkNode<T> | null = null;
    private _tail: SLinkNode<T> | null = null;

    constructor() { }

    add(item: T): this {
        const newNode = new SLinkNode(item);
        if (this._tail && this._head) { // tail and head
            this._tail.next = newNode;
            this._tail = this._tail.next;
        } else if (this._head) { // only head
            this._head = newNode;
            this._tail = this._head;
        } else { // no head or tail
            this._head = newNode;
        }
        this._size++;

        return this;
    }

    pop(): T | null {
        if (this._head) {
            const item = this._head.data;

            this._head = this._head.next;
            this._size--;
            return item;
        }

        return null;
    }

    clear(): this {
        this._head = null;
        this._tail = null;
        this._size = 0;
        return this;
    }

    get head(): SLinkNode<T> | null { return this._head; }

    get tail(): SLinkNode<T> | null { return this._tail; }

    get length(): number { return this._size; }
}
