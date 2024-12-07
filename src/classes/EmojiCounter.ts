import { GuildEmojiManager, Snowflake } from "discord.js";
import { Manager } from "./Manager";
import { Counter } from "./Basic/Counter";
import { supabase } from "../supabase";
import { Database } from "../database.types";

const get_emoji_usage = async (guild_id: Snowflake): Promise<Database['public']['Tables']['emoji_usage']['Row'] | null> => {
    const { data } = await supabase.from('emoji_usage').select('*').limit(1).eq('id', guild_id).single();
    return data;
};

export const CustomEmojiRegex = /(?<!\\)\<\:\w+\:\d{18}\>/g;

type EmojiUsage = {
    id: Snowflake;
    name: string;
    count: number;
};

export class GuildEmojiUsage {
    guildEmojis: Array<EmojiUsage> = [];


    constructor() { }

    resolve(json: string) {

    }
};

export class GuildEmojiUsageCounter extends Manager<Counter> {
    private _guildId: Snowflake;

    constructor(guild: Snowflake) {
        super();
        this._guildId = guild;
    }

    async sync(emojiManager: GuildEmojiManager): Promise<boolean> {
        const emojis = await emojiManager.fetch();
        emojis.forEach(emoji => this.set(emoji.id, new Counter()));

        const data = await get_emoji_usage(this._guildId);

        return true;
    };
}