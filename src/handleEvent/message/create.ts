import { Message } from 'discord.js';
import { shouldRpMsg } from '../../functions/config/shouldReply';
import { getCmdInfo } from '../../functions/discord/msgCommand';
import { doAfterSec } from '../../functions/async/delay';
import { prefix } from '../../app';
import { restrictRange } from '../../functions/number/number';

const create = async (message: Message): Promise<void> => {
    if (shouldRpMsg(message)) {
        if (message.content.substring(0, prefix.length) === prefix) {
            const [command, ...param] = getCmdInfo(message.content);
            if (param.length && command.toLowerCase() === 'say') {
                let delay: number = 0;
                message.delete();
                if (!isNaN(Number(param[0]))) delay = restrictRange(Number(param.shift()), 0, 20);
                await doAfterSec(() => {
                    message.channel.send(param.join(' '));
                }, delay);
            }
        }
    }
}

export = create;