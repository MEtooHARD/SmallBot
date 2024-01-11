import path from 'node:path';
import fs from 'node:fs';
import { EmbedBuilder, InteractionReplyOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import MenuRow from './ActionRow/MenuRow';
import Menu from './ActionRow/StringSelectMenu';
import Option from './ActionRow/StringMenuOption';

class Doc {
    dir: string[];
    name: string;
    embed: EmbedBuilder;
    childDocs: fs.Dirent[];

    constructor(name: string, childDocs: fs.Dirent[], dir: string[], embed: EmbedBuilder) {
        this.name = name;
        this.dir = dir;
        this.embed = embed;
        this.childDocs = childDocs;
    }
}

const backOption = (paths: string[]): Option => {
    return new Option({
        label: 'Back',
        value: paths.slice(0, -1).join('/'),
        emoji: '◀️'
    })
}

const homeOption = (): Option => {
    return new Option({
        label: 'Home',
        value: ['..', 'docs', 'HelpCenter'].join('/'),
        emoji: '🏠'
    })
}

class HelpCenter {

    static serviceName = 'Small Bot Help Center';

    static docRoot = 'docs';

    home = (): InteractionReplyOptions => {
        return this.docMsg(['..', 'docs', 'HelpCenter']);
    }

    docMsg = (paths: string[]): InteractionReplyOptions => {
        const doc = HelpCenter.fetchDoc(paths);
        const options = HelpCenter.options(doc);
        if (paths.length >= 4) options.push(backOption(paths));
        if (paths.length >= 5) options.push(homeOption());
        return {
            ephemeral: true,
            embeds: [doc.embed],
            components: [
                new MenuRow(
                    new Menu({
                        customId: `$[HelpCenter]`,
                        options: options,
                        placeholder: 'Select for more details.'
                    })
                )
            ]
        }
    }

    static options = (doc: Doc): Option[] => {
        return doc.childDocs.filter(x => (x.name.replace('.js', '') !== doc.name) && ((x.isFile() && x.name.endsWith('.js')) || x.isDirectory())).map(x => {
            return new Option({
                label: x.name,
                value: doc.dir.concat(x.name).join('/'),
                emoji: x.isFile() ? '📄' : '📁'
            })
        });
    }

    static fetchDoc = (paths: string[]): Doc => {
        let p = paths;
        if (!paths[paths.length - 1].endsWith('.js'))
            p = p.concat(paths[paths.length - 1] + '.js');
        return {
            dir: paths,
            name: paths.slice(-1)[0],
            embed: require(path.join(...p))(),
            childDocs: paths[paths.length - 1].endsWith('.js') ? [] : fs.readdirSync(path.join(...paths.slice(1)), { withFileTypes: true })
        }
    }

}

export {
    HelpCenter
};