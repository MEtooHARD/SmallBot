import { Colors, EmbedData } from "discord.js";

const Entitled = (): EmbedData => {
    return {
        color: Colors.DarkPurple,
        title: 'Entitled list',
        description: 'Once entitled, one is granted to modify the title, description and entitled list, but only the initiator can start.',
        footer: { text: 'last edited: 2024-07-22' }
    }
};

export = Entitled;