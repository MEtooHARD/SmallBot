import { GuildMember, Snowflake, StageChannel, User, VoiceChannel } from "discord.js";

const atUser = (user: Snowflake | User | GuildMember) => {
    if (user instanceof User || user instanceof GuildMember)
        return `<@${user.id}>`;
    return `<@${user}>`;
}

const atVoiceChannel = (ID: Snowflake | VoiceChannel | StageChannel) => {
    if (ID instanceof VoiceChannel || ID instanceof StageChannel)
        return `<#${ID.id}>`;
    return `<#${ID}>`;
}

export {
    atUser,
    atVoiceChannel
}