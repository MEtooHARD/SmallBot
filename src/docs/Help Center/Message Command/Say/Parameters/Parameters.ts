import { Colors, EmbedData } from "discord.js";
import { HelpCenter } from "../../../../../classes/HelpCenter";

const Say = (): EmbedData => {
    return {
        // author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        // title: 'delay & content',
        // description: '',
        fields: [
            {
                name: 'delay (seconds)',
                value: 'Please write in Arabic numbers, or it will be treat a normal words. ' +
                    'The final range of delay time is restricted betwen 0 and 20 seconds.',
                inline: true
            },
            {
                name: 'content',
                value: 'Whatever you want.',
                inline: true
            }
        ],
        footer: { text: 'last edited: 2024-01-18' }
    }
}

export = Say;