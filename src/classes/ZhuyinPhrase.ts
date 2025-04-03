import rawZhuyinToWordsJSON from '../../media/ZYToWords1.json';
import { randomPick } from '../functions/general/array';

const ZhuyinToWordsJSON = rawZhuyinToWordsJSON as [[string, string[]]];

export class ZhuyinPhrases {
    static readonly ZhuyinToWords: Map<string, string[]> =
        new Map(ZhuyinToWordsJSON as [[string, string[]]]);

    private static readonly Games: Game[] = [];

    static readonly ZhuyinList: string[] = ZhuyinToWordsJSON.map(_ => _[0]);

    static readonly Words: number = ZhuyinToWordsJSON.reduce((acc, cur) => acc + cur[1].length, 0);

    static randomPattern(length: number): string[] {
        return randomPick(ZhuyinPhrases.ZhuyinList, length);
    }

    static createGame(channelId: string, length: number): void {
        ZhuyinPhrases.Games.push(new Game(channelId, length));
    }

    static existsGame(channelId: string): boolean {
        return ZhuyinPhrases.Games.some(_ => _.ChannelID === channelId);
    }
}

class Game {
    readonly ChannelID: string;
    readonly PatLength: number;
    readonly Pattern: string[];

    constructor(channelId: string, length: number) {
        this.ChannelID = channelId;
        this.PatLength = length;
        this.Pattern = ZhuyinPhrases.randomPattern(length);
    }

    // readonly

    async endGame() { }
}
