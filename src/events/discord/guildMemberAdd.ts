import { on } from '../../app';
import { Events, GuildMember } from 'discord.js';
import handleMemberAdd from '../../handleEvent/guildMemberAdd';

const memberAdd = () => {
    on(Events.GuildMemberAdd, async (member: GuildMember) => {
        await handleMemberAdd(member);
    });
}

export = memberAdd;