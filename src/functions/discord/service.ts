import { trimString } from "../general/string";
import path from 'node:path';
import fs from 'node:fs';
import { APIEmbed, ChannelType, Colors, Guild, PermissionFlagsBits } from "discord.js";
import { TimeStamp } from "./mention";

export const getSvcInfo = (str: string): string[] => {
    const result = str.match(RegExp(/\[(?:[\w+-])+\]/g));
    return result ? result.map(s => trimString(s, ['[', ']'])) : [];
}

export const getSvcDir = (dir: string, target: string): string => {
    let resultDir: string[];
    try {
        resultDir = fs.readdirSync(dir);
    } catch (e) {
        console.log(e);
        return '';
    }
    const result = resultDir.filter(x => x === target.concat('.js'))
    return result.length ? path.join(dir, result[0]) : '';
}

export const guildInfoCard = async (guild: Guild): Promise<APIEmbed> => {
    await guild.members.fetch();
    const members = guild.members.cache.map(member => member);
    const humen = members.filter(member => !member.user.bot);
    const bots = members.filter(member => member.user.bot);

    const channels = guild.channels.cache.map(ch => ch);
    const text_channels = channels.filter(ch => ch.isTextBased() && !ch.isThreadOnly());
    const voice_channels = channels.filter(ch => ch.isVoiceBased());
    const categories = channels.filter(ch => ch.type === ChannelType.GuildCategory);

    return {
        color: Colors.Aqua,
        author: { name: 'Basic Guild Info' },
        thumbnail: { url: guild.iconURL() || '' },
        title: guild.name,
        description: guild.description || '',
        fields: [
            { inline: true, name: 'humen', value: String(humen.length) },
            { inline: true, name: 'bots', value: String(bots.length) },
            { inline: true, name: 'admins', value: String(humen.filter(member => member.permissions.has(PermissionFlagsBits.Administrator)).length) },
            { inline: true, name: 'text channels', value: String(text_channels.length) },
            { inline: true, name: 'voice channels', value: String(voice_channels.length) },
            { inline: true, name: 'categories', value: String(categories.length) },
            { inline: true, name: 'time elapsed', value: TimeStamp.gen(guild.createdTimestamp, TimeStamp.Flags.R) },
        ]
    };
};