import path from 'node:path';
import fs from 'node:fs';
import { NestedArray } from './NestedArray';
import { ActionRowBuilder, AnyComponentBuilder, Embed, EmbedBuilder, EmbedData, InteractionReplyOptions, MessageActionRowComponentBuilder, MessageCreateOptions, ReplyOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { ActionRow, Menu } from './ActionRaw';

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

    /* static docDirs = (paths: string[]): NestedArray<string | EmbedData> => {
        return fs.readdirSync(path.join(...paths)).map(x => {
            if (!x.includes('.')) {
                return this.docDirs([...paths, x]);
            } else {
                return require(path.join('..', ...paths, x))();
            }
        })
    } */
    static home = (): Doc => {
        return this.fetchDoc(['..', 'docs', 'HelpCenter']);
    }

    static homeDoc = (): InteractionReplyOptions => {
        return {
            ephemeral: true,
            embeds: [this.home().embed],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                    new StringSelectMenuBuilder()
                        .setCustomId('[HelpCenter][]')
                        .setOptions()
                ])
            ]
        }
    }

    static options = (doc: Doc): StringSelectMenuOptionBuilder[] => {
        return [];
    }

    static docMessage = (paths: string[]): InteractionReplyOptions => {
        return {
            ephemeral: true,
            embeds: [this.home().embed],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                    new StringSelectMenuBuilder()
                        .setCustomId('[HelpCenter][]')
                        .setOptions()
                ])
            ]
        }
    }

    static fetchDoc = (paths: string[]): Doc => {
        return {
            dir: paths,
            name: paths.slice(-1)[0],
            embed: require(path.join(...paths))(),
            childDocsName: fs.readdirSync(path.join(...paths.slice(1))).filter(x => x.substring(x.length - 3) === '.js').map(x => x.substring(0, x.length - 3))
        }
    }


    /* static fetchDoc = (paths: string[]): Doc => {
        return {
            dir: paths,
            name: paths.slice(-1)[0],
            embed: require(path.join(...paths)),
            childDocsName: fs.readdirSync(path.join(...paths)).filter(x => !x.includes('.'))
        }
    } */

}

export {
    HelpCenter
};