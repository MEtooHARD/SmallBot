import { Colors, EmbedData } from "discord.js";
import { HelpCenter } from "../../../classes/HelpCenter";

const Say = (): EmbedData => {
    return {
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Say',
        description: 'test',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = Say;