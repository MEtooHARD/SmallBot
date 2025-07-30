import rawZhuyinToWordsJSON from '../../media/ZYToWords1.json';
import { randomInt } from '../functions/general/number';

const ZTW = rawZhuyinToWordsJSON as [[string, string[]]];

export class ZhuyinPhrase {
    static readonly ZhuyinToWords: Map<string, string[]> =
        new Map(ZTW as [[string, string[]]]);

    private static readonly Games: Game[] = [];

    static readonly ZhuyinList: string[] = ZTW.map(_ => _[0]);
    static readonly ZCount: number = ZhuyinPhrase.ZhuyinList.length;

    static readonly Words: number = ZTW.reduce((acc, cur) => acc + cur[1].length, 0);

    static randomPattern(length: number): number[] {
        return Array.from({ length: length }, (_ => randomInt(0, ZhuyinPhrase.ZCount - 1)));
    }

    static createGame(channelId: string, length: number): void {
        ZhuyinPhrase.Games.push(new Game(channelId, length));
    }

    static existsGame(channelId: string): boolean {
        return ZhuyinPhrase.Games.some(_ => _.ChannelID === channelId);
    }
}

class Game {
    readonly ChannelID: string;
    readonly PLength: number;
    readonly Pattern: number[];

    constructor(channelId: string, length: number) {
        this.ChannelID = channelId;
        this.PLength = length;
        this.Pattern = ZhuyinPhrase.randomPattern(length);
    }

    examine(input: string): boolean {
        if (input.length !== this.PLength) return false;

        for (let i = 0; i < this.PLength; i++)
            if (!ZTW[this.Pattern[i]][1]
                .includes(input[i])) return false;

        return true;
    }

    // readonly

    // async endGame() { }
}
