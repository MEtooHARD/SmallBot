import { GuildEmojiManager, Snowflake } from "discord.js";
import { Counter } from "./Basic/Counter";
import { Manager } from "./Basic/Manager";
import { SFHex } from "./Basic/SFHex";

/* Base Emoji Definition */
class GuildEmojiCounterItem extends Counter {
    protected _emoji: SFHex;

    constructor(emoji: SFHex, c: number) {
        super(c);
        this._emoji = emoji;
    }
    get emoji(): SFHex { return this._emoji; }
    toJSONForm(): EmojiCountJSON { return [this._emoji.dec, this.count]; }
}

type BasicEmojiCountInfo = { id: Snowflake, count: number };
type EmojiCountJSON = [Snowflake, number];
type EmojiCounterGuildJSON = {
    emojis: EmojiCountJSON[],
    id: Snowflake,
    createdAt: number, // timestamp
};
// SJON form: [ID, Count][]
/* Base Emoji Definition */

/* Guild Emoji Counter */
class GuildEmojiCounter extends Manager<GuildEmojiCounterItem> {
    createdAt: number;
    id: SFHex;

    constructor(id: SFHex, t?: number) {
        super();
        this.createdAt = t || Date.now();
        this.id = id;
    }
    /**
     * get all emojis under the given guild (guild emoji manager)
     * @param manager the guild emoji manager
     * @returns this
     */
    syncEmojiMenuFromManager(manager: GuildEmojiManager): this {
        manager.cache.forEach((emoji, id) => {
            if (emoji.name)
                this.set(id,
                    new GuildEmojiCounterItem(
                        new SFHex(emoji.id),
                        0));
        });
        return this;
    }

    getEmojiBasic(id: string): BasicEmojiCountInfo | undefined {
        const item = this.get(id);
        return item && { id: item.emoji.dec, count: item.count };
    }

    getAllEmojiItem(): GuildEmojiCounterItem[] { return [...this.vals()]; }

    getAllEmojiBasic(): BasicEmojiCountInfo[] {
        return this.getAllEmojiItem()
            .map(({ emoji, count }) =>
                ({ id: emoji.hex, count }));
    }
    /**
     * JSON form for storage
     */
    toJSON(): EmojiCounterGuildJSON {
        return {
            createdAt: this.createdAt,
            id: this.id.hex,
            emojis: this.getAllEmojiItem().map(item => item.toJSONForm())
        }
    }
    /**
     * overwrite from data
     */
    fromJSON(json: string): this {
        const a = (JSON.parse(json) as EmojiCounterGuildJSON);
        this.createdAt = a.createdAt;
        this.id = new SFHex(a.id);
        a.emojis.forEach(([id, count]) => {
            this.set(id, new GuildEmojiCounterItem(new SFHex(id), count));
        });
        return this;
    }
}
/* Guild Emoji Counter */

/* Guild Emoji Counter Manager */
export class GuildEmojiCoutnerManager extends Manager<GuildEmojiCounter> {
    constructor() { super(); }

    syncSupabase(): void {

    }
}
/* Guild Emoji Counter Manager */

export const GuildEmojiRegex = /(?<!\\)\<\:\w+\:\d{18}\>/g;
