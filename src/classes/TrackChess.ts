import { APIEmbed } from "discord.js";
import { Position } from "./GeneralTypes";

enum Piece { Null = '▪️', White = '⚪', Red = '🔴' }

enum Arrow { LEFT = '◀️', DOWN = '🔽', RIGHT = '▶️', UP = '🔼', CORNER = '🔵' }

export class TrackChess {
    private _size: number;
    private _board: Piece[][] = [];

    constructor(size: number) {
        this._size = size;
        this._board = Array.from(Array(size * 2).keys())
            .map(x => Array.from(Array(size * 2).keys())
                .map(x => Piece.Null));
    }

    get embed(): APIEmbed {
        return {
            author: { name: 'Track Chess' },
            description: this.body()
        };
    }

    get board(): string[][] {
        return this._board.map(row => row.map(p => p));
    }

    body(): string {
        let body: string[] = [];
        body.push(Arrow.CORNER + Array.from(Array((this._size) * 2)).map(x => Arrow.LEFT).join('') + Arrow.CORNER);

        body.push(...(this.board.map(row => Arrow.DOWN + row.join('') + Arrow.UP)));

        body.push(Arrow.CORNER + Array.from(Array((this._size) * 2)).map(x => Arrow.RIGHT).join('') + Arrow.CORNER);
        return body.join('\n');
    }

    move(piece: Piece, pos: Position): void { this._board[pos.x][pos.y] = piece; }

    execute() {

    }
}