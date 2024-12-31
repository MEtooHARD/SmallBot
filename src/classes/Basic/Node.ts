

export class BaseNode<DataType> {
    constructor(public data: DataType) { }
}

export class SLinkNode<DataType> extends BaseNode<DataType> {
    next: SLinkNode<DataType> | null = null;

    constructor(data: DataType) {
        super(data);
    }
}

export class DoubLinkNode<DataType> extends SLinkNode<DataType> {
    prev: DoubLinkNode<DataType> | null = null;

    constructor(data: DataType) {
        super(data);
    }
}