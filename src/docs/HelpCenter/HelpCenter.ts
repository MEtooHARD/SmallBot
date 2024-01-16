import { Colors, EmbedData } from "discord.js";
import {HelpCenter} from "../../classes/HelpCenter";

const doc = (): EmbedData => {
    return {
        author: { name: HelpCenter.DisplayName },
        color: Colors.DarkGreen,
        title: 'Main',
        description: 'Welcome to Help Center! Here you can learn about some use of my functions. ' +
            'You can click the select menu to learn more details.',
        footer: { text: new Date().toLocaleDateString() }
    }
}

export = doc;