import { Colors, EmbedBuilder } from "discord.js";

const Say = (): EmbedBuilder => {
    return new EmbedBuilder({
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
    })
}

export = Say;