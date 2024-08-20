import { Colors, EmbedBuilder, EmbedData } from "discord.js";

const doc = (): EmbedBuilder => {
    return new EmbedBuilder({
        // author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Slash Command',
        description: 'Here you can see the slash commands we have and how to use them.',
        footer: { text: 'last edited: 2024-01-19' }
    })
}

export = doc;