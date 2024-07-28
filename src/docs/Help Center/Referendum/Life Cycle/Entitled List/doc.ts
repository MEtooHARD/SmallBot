import { Colors, EmbedBuilder } from "discord.js";

const doc = (): EmbedBuilder => {
    return new EmbedBuilder({
        color: Colors.DarkPurple,
        title: 'Entitled list',
        description: 'Once entitled, one is granted to modify the title, description and entitled list, but only the initiator can start.',
        footer: { text: 'last edited: 2024-07-22' }
    });
};

export = doc;