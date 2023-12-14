import { Colors, EmbedData } from "discord.js";
import HelpCenter from "../../classes/HelpCenter";

const gg = (): EmbedData => {
    return {
        author: { name: HelpCenter.serviceName },
        color: Colors.DarkGreen,
        title: 'Main',
        description: 'Welcome to Help Center! Here you can learn about some use of my functions. ' +
            'You can click the select menu to learn more details.',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = gg;