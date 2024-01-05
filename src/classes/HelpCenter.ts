import path from 'node:path';
import fs from 'node:fs';
import { EmbedBuilder, InteractionReplyOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import MenuRow from './ActionRow/MenuRow';

class Doc {
    dir: string[];
    name: string;
    embed: EmbedBuilder;
    childDocsName: string[];

    constructor(name: string, childDocsName: string[], dir: string[], embed: EmbedBuilder) {
        this.name = name;
        this.dir = dir;
        this.embed = embed;
        this.childDocsName = childDocsName;
    }
}

class HelpCenter {

    static serviceName = 'Small Bot Help Center';

    static docRoot = 'docs';

    static home = (): Doc => {
        return this.fetchDoc(['..', 'docs', 'HelpCenter']);
    }

    static homeDoc = (): InteractionReplyOptions => {
        return {
            ephemeral: true,
            embeds: [this.home().embed],
            components: [
                new MenuRow(
                    new StringSelectMenuBuilder()
                        .setCustomId('[HelpCenter][]')
                        .setOptions()
                )
            ]
        }
    }

    static options = (doc: Doc): StringSelectMenuOptionBuilder[] => {
        return [];
    }

    /* static docMessage = (paths: string[]): InteractionReplyOptions => {
        return {
            ephemeral: true,
            embeds: [this.home().embed],
            components: [
                new MenuRow(
                    new Menu({
                        customId: '[HelpCenter][]',
                        options: [
                            new StringSelectMenuOptionBuilder()
                        ]
                    })
                )
            ]
        }
    } */

    static fetchDoc = (paths: string[]): Doc => {
        return {
            dir: paths,
            name: paths.slice(-1)[0],
            embed: require(path.join(...paths))(),
            childDocsName: fs.readdirSync(path.join(...paths.slice(1))).filter(x => x.substring(x.length - 3) === '.js').map(x => x.substring(0, x.length - 3))
        }
    }

}

export {
    HelpCenter
};