import { ButtonInteraction, ButtonStyle, Message, User } from "discord.js";
import { randomInt, range } from "../functions/general/number";
import { Button, EmptyButton } from "./ActionRow/Button";
import ButtonRow from "./ActionRow/ButtonRow";
import { randomPick } from "../functions/general/array";

type XY = {
    x: number
    y: number
}

type NewNumber = {
    position: XY
    value: number
}

enum Action {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
}

export default class T0FE {
    static idleTime = 60 * 1000;

    private board: number[][];
    private _score: number = 0;
    private _steps: number = 0;
    private _gameover: boolean = false;
    private _newNumber: NewNumber | null;
    private _highScore: number = 2;
    private _rowSize: number = 4;
    private _colSize: number = 4;

    boardMessage: Message | null = null;
    controllerMessage: Message | null = null;
    player: User;

    constructor(player: User, row: number, col: number) {
        this._rowSize = row - 1;
        this._colSize = col - 1;
        this.board = range(0, this._rowSize).map(num => range(0, this._colSize).map(num => 0));
        this.player = player;
        this._newNumber = this.randPutNumber();
    };

    async resolveAction(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        switch (interaction.customId.replace('$', '')) {
            case Action.UP:
                this.up();
                break;
            case Action.DOWN:
                this.down();
                break;
            case Action.LEFT:
                this.left();
                break;
            case Action.RIGHT:
                this.right();
                break;
        }
        this._newNumber = this.randPutNumber();
        this._gameover = Boolean(!this._newNumber);
        if (!this._gameover) this._steps++;
        await (this.boardMessage as Message).edit({ components: this.boardDisplay });
        await interaction.editReply({ content: this.progress, components: this.controller });
    }

    get progress() {
        return (this._gameover ? 'GAME OVER\n' : '')
            + this.score + '\n'
            + this.steps + '\n'
            + this.highScore;
    }

    get score() {
        return `Score: ${this._score}`;
    }
    get steps() {
        return `Steps: ${this._steps}`;
    }
    get highScore() {
        return `High Score: ${this._highScore}`;
    }

    left() {
        for (const x of range(0, this._rowSize))
            for (const y of range(0, this._colSize))
                if (this.getNumber({ x: x, y: y }) !== 0) this.moveNumber({ x: x, y: y }, Action.LEFT);
    }

    right() {
        for (const x of range(0, this._rowSize))
            for (const y of range(this._colSize, 0))
                if (this.getNumber({ x: x, y: y }) !== 0) this.moveNumber({ x: x, y: y }, Action.RIGHT);
    }

    up() {
        for (const y of range(0, this._colSize))
            for (const x of range(0, this._rowSize))
                if (this.getNumber({ x: x, y: y }) !== 0) this.moveNumber({ x: x, y: y }, Action.UP);
    }

    down() {
        for (const y of range(0, this._colSize))
            for (const x of range(this._rowSize, 0))
                if (this.getNumber({ x: x, y: y }) !== 0) this.moveNumber({ x: x, y: y }, Action.DOWN);
    }

    setNumber = (XY: XY, number: number): void => { this.board[XY.x][XY.y] = number };
    getNumber = (XY: XY): number => this.board[XY.x][XY.y];

    moveNumber(position: XY, action: Action) {
        let targetPos: XY;
        switch (action) {
            case Action.UP:
                while (this.moveable(position, action)) {
                    targetPos = { x: position.x - 1, y: position.y };
                    if (this.sameValue(targetPos, position)) {
                        this.mergeNumber(position, targetPos);
                        break;
                    } else {
                        this.setNumber(targetPos, this.getNumber(position));
                        this.setNumber(position, 0);
                        position.x--;
                    }
                }
                break;
            case Action.DOWN:
                while (this.moveable(position, action)) {
                    targetPos = { x: position.x + 1, y: position.y }
                    if (this.sameValue(targetPos, position)) {
                        this.mergeNumber(position, targetPos);
                        break;
                    } else {
                        this.setNumber(targetPos, this.getNumber(position));
                        this.setNumber(position, 0);
                        position.x++;
                    }
                }
                break;
            case Action.LEFT:
                while (this.moveable(position, action)) {
                    targetPos = { x: position.x, y: position.y - 1 }
                    if (this.sameValue(targetPos, position)) {
                        this.mergeNumber(position, targetPos);
                        break;
                    } else {
                        this.setNumber(targetPos, this.getNumber(position));
                        this.setNumber(position, 0);
                        position.y--;
                    }
                }
                break;
            case Action.RIGHT:
                while (this.moveable(position, action)) {
                    targetPos = { x: position.x, y: position.y + 1 };
                    if (this.sameValue(targetPos, position)) {
                        this.mergeNumber(position, targetPos);
                        break;
                    } else {
                        this.setNumber(targetPos, this.getNumber(position));
                        this.setNumber(position, 0);
                        position.y++;
                    }
                }
                break;
        }
    }

    mergeNumber(from: XY, to: XY) {
        this.setNumber(to, this.getNumber(to) + this.getNumber(from));
        this.setNumber(from, 0);
        if (this.getNumber(to) > this._highScore) this._highScore = this.getNumber(to);
    }

    sameValue = (a: XY, b: XY): boolean => this.getNumber(a) === this.getNumber(b);

    moveable(position: XY, direction: Action): boolean {
        switch (direction) {
            case Action.UP:
                return this.notAtBoundary(position, direction) &&
                    (this.getNumber({ x: position.x - 1, y: position.y }) === 0 || this.sameValue({ x: position.x - 1, y: position.y }, position));
            case Action.DOWN:
                return this.notAtBoundary(position, direction) &&
                    (this.getNumber({ x: position.x + 1, y: position.y }) === 0 || this.sameValue({ x: position.x + 1, y: position.y }, position));
            case Action.LEFT:
                return this.notAtBoundary(position, direction) &&
                    (this.getNumber({ x: position.x, y: position.y - 1 }) === 0 || this.sameValue({ x: position.x, y: position.y - 1 }, position));
            case Action.RIGHT:
                return this.notAtBoundary(position, direction) &&
                    (this.getNumber({ x: position.x, y: position.y + 1 }) === 0 || this.sameValue({ x: position.x, y: position.y + 1 }, position));
        }
    }

    notAtBoundary(position: XY, direction: Action): boolean {
        switch (direction) {
            case Action.UP:
                return position.x - 1 >= 0;
            case Action.DOWN:
                return position.x + 1 <= this._rowSize;
            case Action.LEFT:
                return position.y - 1 >= 0;
            case Action.RIGHT:
                return position.y + 1 <= this._colSize;
        }
    }

    setBoardMessage = (message: Message): void => { this.boardMessage = message };

    setControllerMessage = (message: Message): void => { this.controllerMessage = message };

    randPutNumber(number: number = 2): NewNumber | null {
        let emptyXY: XY[] = [];
        this.board.forEach((nums, i) => nums.forEach((num, j) => {
            if (num === 0) { emptyXY.push({ x: i, y: j }) }
        }));

        let [xy] = randomPick(emptyXY, 1);
        if (xy) {
            this.setNumber(xy, number);
            this._score += number;
        };
        return xy ? { position: xy, value: number } : null;
    };

    get boardDisplay() {
        return this.board.map((numbers, x) =>
            new ButtonRow(numbers.map((number, y) =>
                new Button({
                    customId: `$${x}${y}`,
                    label: number === 0 ? '\u200b' : number.toString(),
                    style: (x === this._newNumber?.position.x && y === this._newNumber.position.y) ?
                        ButtonStyle.Success
                        :
                        (number === 0) ?
                            ButtonStyle.Secondary
                            :
                            ButtonStyle.Primary
                    ,
                    disabled: true,
                }))
            ));
    };

    get controller() {
        return this._gameover ?
            []
            :
            [
                new ButtonRow([
                    new EmptyButton(1),
                    new Button({
                        customId: `$${Action.UP}`,
                        emoji: '🔼',
                        style: ButtonStyle.Success,
                    }),
                    new EmptyButton(2)
                ]),
                new ButtonRow([
                    new Button({
                        customId: `$${Action.LEFT}`,
                        emoji: '◀️',
                        style: ButtonStyle.Success
                    }),
                    new Button({
                        customId: `$${Action.DOWN}`,
                        emoji: '🔽',
                        style: ButtonStyle.Success,
                    }),
                    new Button({
                        customId: `$${Action.RIGHT}`,
                        emoji: '▶️',
                        style: ButtonStyle.Success
                    })
                ])
            ]
    }
}