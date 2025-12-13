export abstract class StatefulProcessor<I, O> {
    abstract feed(item: I): Generator<O>;
    abstract flush(): Generator<O>;
    pipe<O2>(p: StatefulProcessor<O, O2>): ProcessorPipe<I, O, O2> {
        return new ProcessorPipe(this, p);
    }
}

export class ProcessorPipe<I, M, O> extends StatefulProcessor<I, O> {
    constructor(
        private p1: StatefulProcessor<I, M>,
        private p2: StatefulProcessor<M, O>
    ) { super(); }

    override * feed(item: I): Generator<O> {
        for (const mid of this.p1.feed(item))
            yield* this.p2.feed(mid);
    }

    override * flush(): Generator<O> {
        for (const mid of this.p1.flush())
            yield* this.p2.feed(mid);
        yield* this.p2.flush();
    }
}

export class StringAssembler extends StatefulProcessor<string, string> {
    private buffer: string = '';

    constructor(
        private separator: string = '\n'
    ) { super(); }

    override * feed(item: string): Generator<string> {
        this.buffer += item;

        if (this.buffer.includes(this.separator)) {
            const lines = this.buffer.split(this.separator);
            this.buffer = lines.pop() || ''; // preserve incomplete line

            for (const line of lines) yield line;
        }
    }
    override * flush(): Generator<string> {
        if (this.buffer.length > 0) {
            yield this.buffer;
            this.buffer = '';
        }
    }
    set_separator(separator: string) { this.separator = separator; }
}

export class LineAssembler extends StringAssembler { constructor() { super('\n'); } }