import { GuildMember, Snowflake, StageChannel, User, VoiceChannel } from "discord.js";

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

export namespace TimeStamp {
    export enum Flags {
        NON = '',
        t = ':t', T = ':T',
        d = ':d', D = ':D',
        f = ':f', F = ':F',
        R = ':R'
    };

    export const gen = (time: number, flag: TimeStamp.Flags = TimeStamp.Flags.NON): string => {
        let str = time.toString();
        if (str.length > 10) str = str.slice(0, -3);
        return `<t:${str}${flag}>`;
    };
};

