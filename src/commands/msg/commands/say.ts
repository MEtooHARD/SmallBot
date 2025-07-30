import { MessageCommand } from "../../../classes/MessageFeature";
import { byChance, restrictRange } from "../../../functions/general/number";
import { doAfterSec } from "../../../functions/general/delay";

export const say: MessageCommand = {
    name: 'say',
    param: {
        required: true,
        pattern: ''
    },
    exe: async (message, info) => {
        if (byChance(5)) {
            message.reply('笑死');
        } else {
            let delay: number = 0;
            try { message.delete(); } catch (e) { };
            if (!isNaN(Number(info.params[0]))) delay = restrictRange(Number(info.params[0]), 0, 20);
            await doAfterSec(() => {
                if (!message.channel.isDMBased())
                    message.channel.send(info.params.join(' '));
            }, delay);
        }
        return { success: true };
    }
};
