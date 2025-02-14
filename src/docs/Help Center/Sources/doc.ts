import { Colors, EmbedBuilder } from "discord.js"
import { HelpCenter } from "../../.."

const doc = (): EmbedBuilder => {
    return new EmbedBuilder({
        // author: { name: HelpCenter.DisplayName },
        color: Colors.Blurple,
        title: 'Credits',
        fields: [
            {
                name: 'Discord.js',
                value: 'This project is based on [discord.js](https://discord.js.org/)',
                inline: true
            }, {
                name: 'homo',
                value: 'some of the features uses modified code from this [project](https://github.com/itorr/homo)',
                inline: true
            }
        ],
        footer: { text: 'last edited: 2025-2-12' }
    })
}

export = doc