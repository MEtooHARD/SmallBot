import { Channel, Guild, Snowflake } from "discord.js"
import { client } from "../../app"

export type GuildChannelSet = [Snowflake, Snowflake];

export const fetchGuild = async (
    id: Snowflake
): Promise<[any | null, Guild | null]> => {
    try {
        return [null, await client.guilds.fetch(id)];
    } catch (e) {
        return [e, null];
    }
};

export const fetchChannel = async (
    guild_id: Snowflake,
    channel_id: Snowflake
): Promise<[any | null, Channel | null]> => {
    try {
        const [error, guild] = await fetchGuild(guild_id);
        if (guild)
            return [null, await guild.channels.fetch(channel_id)];
        else
            throw error;
    } catch (e) {
        return [e, null];
    }
};