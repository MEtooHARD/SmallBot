import { byChance, restrictRange } from '../functions/general/number';
import { AttachmentBuilder, ButtonStyle, Message } from 'discord.js';
import { shouldRpMsg } from '../functions/config/shouldReply';
import { getCmdInfo } from '../functions/discord/msgCommand';
import { doAfterSec } from '../functions/general/delay';
import ButtonRow from '../classes/ActionRow/ButtonRow';
import { prefix } from '../app';
import path from 'node:path';
import fs from 'node:fs';

const create = async (message: Message): Promise<void> => {

    if (shouldRpMsg(message)) {
        if (message.content.startsWith(prefix)) {
            const [command, ...param] = getCmdInfo(message.content);
            if (command === 'fUCKoFF') {
                await message.client.destroy();
                process.exit(1);
            } else if (param.length && command.toLowerCase() === 'say') {
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
        } else if (message.content.includes('114514')) {
            message.channel.send({
                files: [new AttachmentBuilder(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'media', 'pic', '114514.webp')))]
            });
        } else if (message.content.includes('臭')) {
            if (byChance(50)) message.reply('好臭');
        } else if (byChance(5) && !message.channel.isDMBased()) {
            const earn500 = (disabled: boolean = false) => [new ButtonRow([{
                customId: 'earn500',
                label: 'Earn $500',
                style: ButtonStyle.Primary,
                disabled: disabled
            }])];

            message.channel.send({
                content: 'Being poor?',
                components: earn500(false)
            });
        }
    }
}

export = create;