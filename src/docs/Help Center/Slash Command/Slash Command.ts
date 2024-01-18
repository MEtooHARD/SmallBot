import { Colors, EmbedData } from "discord.js";
import { HelpCenter } from "../../../classes/HelpCenter";

const SlashCommands = (): EmbedData => {
    return {
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Slash Command',
        description: 'Here you can see the slash commands we have and how to use them.',
        footer: { text: 'last edited: 2024-01-18' }
    }
}

export = SlashCommands;