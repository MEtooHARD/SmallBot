import { GuildMember, Snowflake, StageChannel, User, VoiceChannel } from "discord.js";

const atUser = (ID: Snowflake | User | GuildMember) => {
    if (ID instanceof User)
        return `<@${ID.id}>`;
    if (ID instanceof GuildMember)
        return `<@${ID.user.id}>`;
    return `<@${ID}>`;
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