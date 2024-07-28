import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import path from 'node:path';
import fs from 'node:fs';

export class Docor {
    private _Document: Docor.Doc;

    constructor(base: string, name: string) {
        this._Document = new (Docor.Doc(base, EmbedBuilder))(name);
    };

    getDoc(route: string[]): Docor.Doc | undefined {
        if (route[0] === this._Document.name) return this._Document;
        let doc: Docor.Doc | undefined = this._Document;
        for (const r of route.slice(1)) {
            if (doc === undefined)
                break;
            doc = doc.getChild(r);
        }
        return doc;
    };

    async handleInteraction(interaction: StringSelectMenuInteraction) {
        const doc = this.getDoc(interaction.values[0].split('>'));
        try {
            if (doc) {
                await interaction.update({
                    embeds: doc.getEmbeds(),
                    components: [Docor.resolveToSelectMenu(doc)]
                });
            } else {
                await interaction.update({
                    content: 'version outdated',
                    embeds: [],
                    components: []
                })
            }
        } catch (e) { }
    };

    static resolveToSelectMenu(doc: Docor.Doc): ActionRowBuilder<StringSelectMenuBuilder> {
        const route = doc.getRoute();
        const menu = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(`$[${doc.rootName}]`)
                .setPlaceholder(route.join(' > ').slice(-30))
                .setOptions(...Array.from(doc.children.keys())
                    .map(key => doc.children.get(key) as Docor.Doc)
                    .map(d => new StringSelectMenuOptionBuilder()
                        .setLabel(d.name)
                        .setValue(route.concat(d.name).join('>'))
                        .setEmoji(d.children.size ? '📑' : '📁')))
                .addOptions((doc.level > 0)
                    ? [new StringSelectMenuOptionBuilder()
                        .setLabel('Back')
                        .setValue(route.slice(0, -1).join('>'))
                        .setEmoji('◀️')]
                    : [])
                .addOptions((doc.level > 1)
                    ? [new StringSelectMenuOptionBuilder()
                        .setLabel('Home')
                        .setValue(doc.rootName)
                        .setEmoji('🏠')]
                    : [])
            );
        return menu;
    };
};

export namespace Docor {
    export type Doc = InstanceType<ReturnType<typeof Docor.Doc<EmbedBuilder>>>;

    export function Doc<T>(
        base: string,
        ClassType: new (...args: any[]) => T,
        fileName: string = 'doc.js',
    ) {
        return class Doc {
            static base: string = base;

            private _root: Doc | null;
            private _children: Map<string, Doc> = new Map<string, Doc>();
            private _name: string;
            private _level: number = 0;
            private _embedF: () => T;

            constructor(name: string, r?: Doc, l?: number) {
                this._root = r || null;
                this._level = l || 1;
                this._name = name;
                const entry = this.getDir() + this._name;
                this._embedF = require(entry + fileName);
                // ch
                if (fs.existsSync(entry) && fs.statSync(entry).isDirectory())
                    fs.readdirSync(entry, { withFileTypes: true })
                        .forEach(item => {
                            const p = path.join(entry, item.name, fileName);
                            if (item.isDirectory()
                                && fs.existsSync(p)
                                && typeof require(p) === 'function'
                                && require(p)() instanceof ClassType)
                                this._children.set(item.name, new Doc(item.name, this, this._level + 1));
                        });
            };

            get name(): string { return this._name; };
            get children() { return this._children; };
            get level(): number { return this._level; };
            get rootName(): string { return this._root === null ? this._name : this._root.rootName; }

            private getEmbed(): T { return this._embedF(); };

            getEmbeds(): T[] {
                return this._root === null
                    ? [this.getEmbed()]
                    : this._root.getEmbeds().concat(this.getEmbed());
            };

            getChild(c: string) { return this._children.get(c); };

            getRoute(): string[] {
                return this._root === null
                    ? [this._name]
                    : this._root.getRoute().concat(this._name);
            };

            private getDir(): string {
                return this._root === null
                    ? Doc.base
                    : path.join((this._root as Doc).getDir() + this._root._name);
            };
        };
    }
};
