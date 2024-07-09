import { GuildMember, Snowflake, StageChannel, User, VoiceChannel } from "discord.js";
import t from "../../handleEvent/messageCreate/commands/t";

export const atUser = (user: Snowflake | User | GuildMember) => {
    if (user instanceof User || user instanceof GuildMember)
        return `<@${user.id}>`;
    return `<@${user}>`;
}

export const atVoiceChannel = (ID: Snowflake | VoiceChannel | StageChannel) => {
    if (ID instanceof VoiceChannel || ID instanceof StageChannel)
        return `<#${ID.id}>`;
    return `<#${ID}>`;
};

export const timestamp = (time: number) => (`<t:${t}>`);
