import { range } from "../functions/general/number";
import { NestedArray } from "./NestedArray";

export default class TZFE {
    board: NestedArray<number | null>;
    left() { };
    right() { };
    up() { };
    down() { };

    constructor() {
        this.board = range(0, 4).map(num => range(0, 4).map(num => null));
    }
}