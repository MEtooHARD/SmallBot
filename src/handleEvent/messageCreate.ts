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
import Selecter from './messageCreate/Selecter';

const create = async (message: Message): Promise<void> => {

    if (shouldRpMsg(message))
        Selecter.exe(message);
    /*{
    // else if (/\d/.test(message.content) && byChance(5)) {
    //     const numbers = message.content.match(/\d+/gm) as RegExpMatchArray;
    //     const theOneChosenShit = numbers[randomInt(0, numbers.length - 1)];
    //     const result = homo(Number(theOneChosenShit));
    //     message.reply(`${theOneChosenShit} = \`${result}\``);
    } else if (byChance(1)) {
    //     do {
    //         try { message.channel.sendTyping(); } catch (e) { }
    //         delaySec(randomInt(8, 15));
    //     } while (byChance(10))
    // } else if (message.content.includes('114514')) {
    //     message.channel.send({
    //         files: [new AttachmentBuilder(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'media', 'pic', '114514.webp')))]
    //     });
    } else if (message.content.includes('臭')) {
        if (byChance(50)) message.reply('好臭');
    } else if (byChance(2) && !message.channel.isDMBased()) {
        message.channel.send({
            content: 'Being poor?',
            components: earn500(false)
        });
    }
}
*/
}

export = create;