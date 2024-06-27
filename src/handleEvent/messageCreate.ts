import { byChance, randomInt, restrictRange } from '../functions/general/number';
import { AttachmentBuilder, Message } from 'discord.js';
import { shouldRpMsg } from '../functions/config/shouldReply';
import { getCmdInfo } from '../functions/discord/msgCommand';
import { delaySec, doAfterSec } from '../functions/general/delay';
import { prefix } from '../app';
import path from 'node:path';
import fs from 'node:fs';
import { earn500 } from '../functions/discord/cmps';
import homo from '../functions/general/homo';

const create = async (message: Message): Promise<void> => {

    if (shouldRpMsg(message)) {
        if (message.content.startsWith(prefix)) {
            const [command, ...param] = getCmdInfo(message.content);
            if (command === 'fUCKoFF') {
                await message.client.destroy();
                process.exit(1);
            } else if (param.length && command.toLowerCase() === 'say') {
                if (byChance(5)) {
                    message.reply('笑死');
                } else {
                    let delay: number = 0;
                    message.delete();
                    if (!isNaN(Number(param[0]))) delay = restrictRange(Number(param.shift()), 0, 20);
                    await doAfterSec(() => {
                        message.channel.send(param.join(' '));
                    }, delay);
                }
            } else if (command === 't') {
                const emojiRegex = /\b\w+\:\d{19}\b/g;
                // console.log(param)
                message.delete();
                await message.channel.sendTyping();
                // await delaySec(randomInt(5, 10));
                if (param.length) message.channel.send(param.map(text => emojiRegex.test(text) ? `<:${text}>` : text).join(' '));
            }
        } else if (/\d/.test(message.content) && byChance(5)) {
            const numbers = message.content.match(/\d+/gm) as RegExpMatchArray;
            const theOneChosenShit = numbers[randomInt(0, numbers.length - 1)];
            const result = homo(Number(theOneChosenShit));
            message.reply(`${theOneChosenShit} = \`${result}\``);
        } else if (byChance(1)) {
            do {
                try { message.channel.sendTyping(); } catch (e) { }
                delaySec(randomInt(8, 15));
            } while (byChance(10))
        } else if (message.content.includes('114514')) {
            message.channel.send({
                files: [new AttachmentBuilder(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'media', 'pic', '114514.webp')))]
            });
        } else if (message.content.includes('臭')) {
            if (byChance(50)) message.reply('好臭');
        } else if (byChance(2) && !message.channel.isDMBased()) {


            message.channel.send({
                content: 'Being poor?',
                components: earn500(false)
            });
        }
    }
}

export = create;