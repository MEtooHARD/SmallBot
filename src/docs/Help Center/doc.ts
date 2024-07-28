import { Colors, EmbedBuilder, EmbedData } from "discord.js";
import { HelpCenter } from "../../HelpCenter";

const doc = (): EmbedBuilder => {
    return new EmbedBuilder({
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Help Center',
        description: 'Hi, there. This is MEtooHARD.\n' +
            'Welcome to the Help Center.\n' +
            'Here you can learn how to use this bot\'s functions and prob something interesting.',
        footer: { text: 'last edited: 2024-01-18' }
    })
}

export = doc;