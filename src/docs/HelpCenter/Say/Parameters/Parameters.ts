import { Colors, EmbedData } from "discord.js";
import { HelpCenter } from "../../../../classes/HelpCenter";

const Say = (): EmbedData => {
    return {
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Parameters',
        description: 'The `s!say` command can obtain at most one `number` parameter, right after the `s!say` command with a space. It represents the seconds to delay. And will be restricted between 0 and 20.',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = Say;