import { Colors, EmbedBuilder } from "discord.js";

const SlashCommands = (): EmbedBuilder => {
    return new EmbedBuilder({
        // author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Bomb',
        description: '</bomb:1190925838330372117>\n' +
            'Use this command to "bomb" someone. There\'re some options that you can customize the bombing behavior.',
        fields: [
            {
                name: 'target',
                value: 'the person you want to bomb',
                inline: true
            },
            {
                name: 'count',
                value: 'How many times you want to bomb. between 1 and 20.',
                inline: true
            },
            {
                name: 'period',
                value: 'The interval between each bomb in seconds. between 2 and 15.',
                inline: true
            }
        ],
        footer: { text: 'last edited: 2024-01-19' }
    })
}

export = SlashCommands;