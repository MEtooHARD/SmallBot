import { ButtonStyle, ComponentType, Message, MessageComponentInteraction } from 'discord.js';
import { shouldRpMsg } from '../../functions/config/shouldReply';
import { getCmdInfo } from '../../functions/discord/msgCommand';
import { doAfterSec } from '../../functions/general/delay';
import { prefix } from '../../app';
import { byChance, restrictRange } from '../../functions/general/number';
import ButtonRow from '../../classes/ActionRow/ButtonRow';
import { Button } from '../../classes/ActionRow/Button';
import { atUser } from '../../functions/discord/mention';

const create = async (message: Message): Promise<void> => {


    if (shouldRpMsg(message)) {
        if (/* message.content.substring(0, prefix.length) === prefix */message.content.startsWith(prefix)) {
            const [command, ...param] = getCmdInfo(message.content);
            if (param.length && command.toLowerCase() === 'say') {
                if (byChance(100)) {
                    message.reply('笑死');
                }
                else {
                    let delay: number = 0;
                    message.delete();
                    if (!isNaN(Number(param[0]))) delay = restrictRange(Number(param.shift()), 0, 20);
                    await doAfterSec(() => {
                        message.channel.send(param.join(' '));
                    }, delay);
                }
            }
        } else if (message.content.includes('臭')) {
            if (byChance(50)) message.reply('好臭');
        } else if (byChance(5)) {
            const earn500 = (disabled: boolean = false) => [new ButtonRow([{
                customId: '$lmao',
                label: 'Earn $500',
                style: ButtonStyle.Primary,
                disabled: disabled
            }])];

            const msg = await message.channel.send({
                content: 'Being poor?',
                components: earn500(false)
            });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 2 * 60 * 1000
            });

            collector.on('collect', (interaction: MessageComponentInteraction) => {
                try {
                    interaction.message.edit({ components: earn500(true) });
                } catch (e) { }
                interaction.reply(atUser(interaction.user) + '這你也信');
            });
        }
    }
}

export = create;