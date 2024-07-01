import { on } from '../app';
import { Events, Guild, GuildMember } from 'discord.js';
import handleMemberAdd from '../handleEvent/guildMemberAdd';
import handleGuildCreate from '../handleEvent/guildCreate';

const guildCreate = () => {
    on(Events.GuildCreate, async (guild: Guild) => {
        await handleGuildCreate(guild);
    });
}

export = guildCreate;