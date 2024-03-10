import { on } from '../app';
import { Events, GuildMember } from 'discord.js';
import handleMemberRemove from '../handleEvent/guildMemberRemove';

const memberRemove = () => {
    on(Events.GuildMemberRemove, async (member: GuildMember) => {
        await handleMemberRemove(member);
    });
}

export = memberRemove;