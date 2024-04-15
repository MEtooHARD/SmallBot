import { APIEmbed, ButtonStyle, Colors, InteractionReplyOptions, InteractionUpdateOptions, MessageEditOptions, Snowflake, User } from "discord.js";
import ButtonRow from "./ActionRow/ButtonRow";
import { Button } from "./ActionRow/Button";
import { Position } from "./GeneralTypes";
import { atUser } from "../functions/discord/mention";

enum PieceMark { Null = '▪', White = '⚪', Red = '🔴' }

export class Piece extends Position {
    mark: PieceMark = PieceMark.Null;
    constructor(x: number = -1, y: number = -1, mark: PieceMark = PieceMark.Null) {
        super(x, y);
        this.mark = mark;
    }
}

// enum Arrow { LEFT = '◀️', DOWN = '🔽', RIGHT = '▶️', UP = '🔼', CORNER = '🔵' }

export class TrackChess {
    private p1: User;
    private p2: User;
    private board: PieceMark[][];
    private actingPiece: Piece = new Piece();
    private p1Acting: boolean = true;
    private count: number = 0;
    private winner: User | null = null;

    static size = 4;
    static StatusColor = 0x0055de;
    static CustomIDs = {
        Accept: '$AC',
        Deny: '$DN',
        Next: '$Next'
    }

    constructor(p1: User, p2: User) {
        this.p1 = p1;
        this.p2 = p2;

        this.board = Array.from(Array(TrackChess.size).keys())
            .map(row => Array.from(Array(TrackChess.size).keys())
                .map(p => PieceMark.Null));
    }

    update(): InteractionUpdateOptions {
        return {
            embeds: this.statusUI(),
            components: this.boardUI()
        }
    }

    win(): void { this.winner = this.actingPlayer; }

    set act(action: Piece) { this.actingPiece = action; }

    get actingPlayer(): User { return this.p1Acting ? this.p1 : this.p2; }
    get actingPlayerMark(): PieceMark { return this.p1Acting ? PieceMark.White : PieceMark.Red; }

    putMark(): void {
        this.board[this.actingPiece.x][this.actingPiece.y] = this.actingPiece.mark;
        this.count++;
    }

    clear(): void { this.actingPiece = new Piece(-1, -1, PieceMark.Null); }

    toggle(): void { this.p1Acting = !this.p1Acting; }

    resetAction() {
        this.actingPiece.x = -1;
        this.actingPiece.y = -1;
        this.actingPiece.mark = PieceMark.Null;
    }

    rotate(): void {
        for (const i of Array(3).keys())
            [this.board[0][i], this.board[0][i + 1]] = [this.board[0][i + 1], this.board[0][i]];

        for (const i of Array(3).keys())
            [this.board[i][3], this.board[i + 1][3]] = [this.board[i + 1][3], this.board[i][3]];

        for (const i of Array(3).keys())
            [this.board[3][3 - i], this.board[3][2 - i]] = [this.board[3][2 - i], this.board[3][3 - i]];

        for (const i of Array(2).keys())
            [this.board[3 - i][0], this.board[2 - i][0]] = [this.board[2 - i][0], this.board[3 - i][0]];

        [this.board[1][1], this.board[1][2]] = [this.board[1][2], this.board[1][1]];
        [this.board[1][2], this.board[2][2]] = [this.board[2][2], this.board[1][2]];
        [this.board[2][2], this.board[2][1]] = [this.board[2][1], this.board[2][2]];
    }

    checkWin(): boolean {
        for (let x = 0; x < 4; x++)
            if (this.checkLine(x, 0, 0, 1, x, 4)) return true;
        for (let y = 0; y < 4; y++)
            if (this.checkLine(0, y, 1, 0, 4, y)) return true;
        if (this.checkLine(0, 0, 1, 1, 4, 4)) return true;
        if (this.checkLine(3, 0, -1, 1, -1, 4)) return true;
        return false;
    }

    isNowActing(user: User): boolean { return user.id === (this.p1Acting ? this.p1 : this.p2).id; }

    statusUI(): APIEmbed[] {
        return [{
            author: { name: 'TrackChess' },
            color: TrackChess.StatusColor,
            description: `${atUser(this.p1)} V.S. ${this.p2}\n`
                .concat(
                    this.winner ?
                        `${atUser(this.winner)} won!`
                        :
                        this.count === 16 ?
                            'No one won. Both suck (wink).'
                            :
                            `\nNow Acting: ${atUser(this.actingPlayer.id)}\nSelect a grid and press \`Next\` to proceed your turn.`
                ),
            footer: { text: 'idle time limit: 5 min' }
        }]
    }

    boardUI(): ButtonRow[] {
        return [
            ...Array.from(Array(TrackChess.size).keys())
                .map((row, x) => new ButtonRow(Array.from(Array(TrackChess.size).keys())
                    .map((p, y) => new Button({
                        customId: '$'.concat(x.toString()).concat(y.toString()),
                        style: (this.actingPiece.x === x && this.actingPiece.y === y) ? ButtonStyle.Success : ButtonStyle.Secondary,
                        emoji: this.board[x][y] === PieceMark.Null ? (x === this.actingPiece.x && y === this.actingPiece.y ? this.actingPiece.mark : PieceMark.Null) : this.board[x][y],
                        disabled: this.winner !== null || this.board[x][y] !== PieceMark.Null
                    })))),
            ...(this.winner !== null || this.count === 16 ? [] : [new ButtonRow([new Button({
                customId: TrackChess.CustomIDs.Next,
                style: ButtonStyle.Success,
                label: 'Next',
                disabled: this.actingPiece.mark === PieceMark.Null
            })])]),
        ]
    }

    checkLine(x: number, y: number, dx: number, dy: number, tx: number, ty: number): boolean {
        if (this.board[x][y] === PieceMark.Null) return false;
        const winMark: PieceMark = this.board[x][y];
        for (x += dx, y += dy; x < 4 && y < 4 && this.board[x][y] === winMark; x += dx, y += dy);
        return x === tx && y === ty;
    }

    static inviteCheck(p1: User, p2: User): InteractionReplyOptions {
        return (p1.id === p2.id || p2.bot) ? {
            ephemeral: true,
            embeds: [{ title: 'Stop sucking.' }]
        } : {
            embeds: [{
                color: Colors.Yellow,
                title: 'Track Chess',
                description: 'Waiting for ' + atUser(p2) + ' to accept.',
                footer: { text: 'limit: 5 min' }
            }],
            components: [
                new ButtonRow([
                    new Button({
                        customId: this.CustomIDs.Accept,
                        label: 'Accept',
                        style: ButtonStyle.Success,
                    }),
                    new Button({
                        customId: this.CustomIDs.Deny,
                        label: 'Deny',
                        style: ButtonStyle.Danger
                    })
                ])
            ]
        };
    }

    static inviteDenied(player: User): InteractionUpdateOptions {
        return {
            embeds: [{
                color: 0xbd6b55,
                title: 'Invitation failed.',
                description: atUser(player) + ' You\'ve been denied, lmao.'
            }],
            components: []
        }
    }

    static inviteExpired(player: User): MessageEditOptions {
        return {
            embeds: [{
                color: 0xbd6b55,
                title: 'Invitation failed.',
                description: atUser(player) + ' You havn\'t even got a response. How lamentable.'
            }],
            components: []
        }
    }
}