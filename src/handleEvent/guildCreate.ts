import { Guild, Message, PermissionsBitField, TextChannel } from 'discord.js';
import { shouldRpMsg } from '../functions/config/shouldReply';
import Selecter from './messageCreate/Selecter';

const handleGuildCreate = async (guild: Guild): Promise<void> => {
    const me = await guild.members.fetch(guild.client)
    if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {
        try {
            (guild.channels.cache
                .filter(ch => ch instanceof TextChannel && ch.permissionsFor(me)
                    .has(PermissionsBitField.Flags.SendMessages))
                .map(ch => ch)[0] as TextChannel)
                .send('再不給權限啊');
        } catch (e) { };
        guild.leave();
    }
};

export = handleGuildCreate;