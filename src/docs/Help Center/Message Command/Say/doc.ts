import { Colors, EmbedBuilder } from "discord.js";

const Say = (): EmbedBuilder => {
    return new EmbedBuilder({
        // author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Say',
        description: 'Format: `s!say <delay> <content>`\n' +
            'You can use this command then I\'ll "say" the `content` for you. ~~maybe not (wink)~~\n',
        /* fields: [
            {
                name: 'delay',
                value: 'The time you want to delay, in seconds.',
                inline: true
            },
            {
                name: 'content',
                value: 'The content you want me to say.',
                inline: true
            }
        ], */
        footer: { text: 'last edited: 2024-01-18' }
    })
}

export = Say;