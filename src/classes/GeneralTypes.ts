export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
};

export interface NestedArray<T> extends Array<T | NestedArray<T>> { };