import { ButtonStyle, Message, User } from "discord.js";
import { randomInt, range } from "../functions/general/number";
import { Button, EmptyButton } from "./ActionRow/Button";
import ButtonRow from "./ActionRow/ButtonRow";

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

    boardMessage: Message | null = null;
    controllerMessage: Message | null = null;
    player: User;

    constructor(player: User) {
        this.board = range(0, 4).map(num => range(0, 4).map(num => 0));
        this.player = player;
    };

    resolveAction(action: string) {
        switch (action.replace('$', '')) {
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
    }

    left() {
        this.randPutNumber();
    }

    right() {

    }

    up() {

    }

    down() {

    }

    setBoardMessage = (message: Message) => this.boardMessage = message;

    setControllerMessage = (message: Message) => this.controllerMessage = message;

    randPutNumber(number: number = 2) {
        let success: boolean = false;
        for (let count = 0; !success && count < 20; count++) {
            let x = randomInt(0, 4), y = randomInt(0, 4);
            if (this.board[x][y] === 0) {
                success = true;
                this.board[x][y] = number
                console.log('put ' + number + ' at ' + x + ', ' + y);
            }
        }
    };

    get score() {
        return `Score: ${this._score}`;
    }

    get boardDisplay() {
        return this.board.map((numberRow, i) =>
            new ButtonRow(numberRow.map((number, j) =>
                new Button({
                    customId: `$${i}${j}`,
                    label: number === 0 ? '\u200b' : number.toString(),
                    style: ButtonStyle.Primary,
                    disabled: true,
                }))
            ));
    };

    get controller() {
        return [
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