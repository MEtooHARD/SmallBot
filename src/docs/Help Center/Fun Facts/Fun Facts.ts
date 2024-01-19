import { Colors, EmbedData } from "discord.js";
import Embed from "../../../classes/Embed";
import { HelpCenter } from "../../../classes/HelpCenter";
import { randomInt } from "../../../functions/general/number";

const FunFacts = (): EmbedData | Embed => {
    const colors = Object.keys(Colors);

    return new Embed({
        // color: ,
        author: { name: 'You Suck' },
        title: 'You Suck',
        description: 'You Suck',
        fields: [
            {
                name: 'You Suck',
                value: 'You Suck'
            }
        ],
        footer: { text: 'You Suck' }
    }).setColor('Random')
        .setImage('https://tenor.com/view/you-suck-suck-sucks-spongbob-gif-13704895');
    /* {
        // author: { name: HelpCenter.DisplayName },
        color: ,
        title: 'You Suck',
        description: 'Hi, there. This is MEtooHARD.\n' +
            'Welcome to the Help Center.\n' +
            'Here you can learn how to use this bot\'s functions and prob something interesting.',
        footer: { text: 'last edited: 2024-01-18' }
    } */
}

export = FunFacts;