import { Message } from "discord.js";
import { MessageCommand } from "../../../classes/MessageFeature";
import { byChance, restrictRange } from "../../../functions/general/number";
import { doAfterSec } from "../../../functions/general/delay";

export = new class say extends MessageCommand {
    filter = (message: Message<boolean>, param: string[]): boolean => {
        return Boolean(param.length);
    };
    exe = async (message: Message<boolean>, param: string[]): Promise<void> => {
        if (byChance(5)) {
            message.reply('笑死');
        } else {
            let delay: number = 0;
            try { message.delete(); } catch (e) { };
            if (!isNaN(Number(param[0]))) delay = restrictRange(Number(param.shift()), 0, 20);
            await doAfterSec(() => {
                if (!message.channel.isDMBased())
                    message.channel.send(param.join(' '));
            }, delay);
        }
    };
};