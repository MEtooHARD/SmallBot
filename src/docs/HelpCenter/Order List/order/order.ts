import { Colors, EmbedData } from "discord.js";
import {HelpCenter} from "../../../../classes/HelpCenter";

const order = (): EmbedData => {
    return {
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Order',
        description: 'To order, just ',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = order;