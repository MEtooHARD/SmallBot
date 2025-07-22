enum Operation {
    ADD = '+',
    SUBTRACT = '-',
    MULTIPLY = '*',
    DIVIDE = '/',
    POWER = '^'
}

abstract class Statement {
    value: string;

    constructor(value: string) {
        this.value = value;
    }

    abstract evaluate(): number;
}

class Expression extends Statement {
    left: Statement;
    right: Statement;

    constructor(left: Statement, right: Statement, value: string) {
        super(value);
        this.left = left;
        this.right = right;
    }

    evaluate(): number {
        // Placeholder for evaluation logic
        return 0;
    }
}

class Constant extends Statement {
    constructor(value: string) {
        super(value);
    }

    evaluate(): number {
        return parseFloat(this.value);
    }
}

class FormulaTree {
    root: Statement;

    constructor(root: Statement) {
        this.root = root;
    }

    evaluate(): number {
        // Placeholder for evaluation logic
        return 0;
    }

    toString(): string {
        return this.root.value;
    }
}