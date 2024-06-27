import { Colors, EmbedData } from "discord.js";

const LiteraryInquisition = (): EmbedData => {
    return {
        color: 0x7b5c00,
        title: 'homo',
        description: 'one of the conditions is that your message contains numbers. and for such gracious, SmallBot responds you with gracious numbers. <3',
        fields: [{
            name: '\u200b',
            value: '[reference](https://github.com/itorr/homo)'
        }],
        footer: { text: 'last edited: 2024-06-27' }
    }
}

export = LiteraryInquisition;