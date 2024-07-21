import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, ActionRow, ButtonStyle, Colors, ComponentType, GuildMember, InteractionReplyOptions, InteractionUpdateOptions, Message, MessageCreateOptions, MessageEditOptions, ModalComponentData, Snowflake, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputStyle } from "discord.js";
import { Document, Types } from "mongoose";
import { TextInputRow } from "./ActionRow/Modal";
import { a_b_percent, ordinal } from "../functions/general/number";
import { TimeStamp, atUser } from "../functions/discord/mention";
import { ActionRowBuilder, ButtonBuilder, RoleSelectMenuBuilder } from "@discordjs/builders";
import { overlap } from "../functions/general/array";
import ButtonRow from "./ActionRow/ButtonRow";
import { v4 as uuidv4 } from 'uuid';
import { x_min_y_sec } from "../functions/general/string";

export interface IReferendum extends Document {
    _id: Types.ObjectId,
    title: string;
    description: string;
    startedAt: number;
    closedAt: number;
    stage: Referendum.Stage;
    createdBy: Snowflake;
    guildId: Snowflake;
    message: {
        channelId: Snowflake;
        messageId: Snowflake;
    };
    entitled: Snowflake[];
    users: Snowflake[];
    sessions: Map<Snowflake, string>;
    proposals: Referendum.Proposal[];
};

export class Referendum {
    private _document: IReferendum;
    private _checkList: Map<Referendum.CheckList, boolean> = new Map<Referendum.CheckList, boolean>(
        Object.keys(Referendum.CheckList)
            .map(key => [Referendum.CheckList[key as keyof typeof Referendum.CheckList], false])
    );
    static _proposalMaxAmount: number = 6;

    constructor(doc: IReferendum) {
        this._document = doc;
    };

    getMessage(): MessageCreateOptions & MessageEditOptions {
        const embeds = [this.getMainEmbed()];
        const components = [];

        switch (this._document.stage) {
            case Referendum.Stage.PREPARING:
                embeds.push(this.getEntitledEmbed());
                components.push(this.getCheckListRow(),
                    this.getPreparingProposalsRow(),
                    this.getStartButtonRow());
                break;
            case Referendum.Stage.ACTIVE:
                components.push(this.getActiveButtonRow(),
                    this.getTestButtonRow());
                break;
            case Referendum.Stage.CLOSED:
                components.push(this.getTestButtonRow());
                break;
        }

        return {
            embeds: embeds,
            components: components
        };
    };

    master(member: GuildMember): boolean { return member.id === this._document.createdBy; };

    entitled(member: GuildMember): boolean {
        return this._document.createdBy === member.id ||
            this._document.entitled.includes(member.id) ||
            overlap(this._document.entitled.filter(id => id.startsWith('&')),
                member.roles.cache.map(role => role.id))
    };

    private getMainEmbed(): APIEmbed {
        return {
            color: this.getColor(),
            author: Referendum.getAuthor(),
            title: this.getTitle(),
            description: this.getDescription(),
            fields: this.getFields(),
            footer: this.getFooter()
        };
    };

    private getColor(): number {
        switch (this._document.stage) {
            case Referendum.Stage.ACTIVE: return Colors.Green;
            case Referendum.Stage.CLOSED: return Colors.LightGrey;
            case Referendum.Stage.PREPARING: return Colors.Yellow;
        }
    };

    private static getAuthor(): APIEmbedAuthor { return { name: 'Referendum (alpha)' }; };

    private getTitle(): string { return `> ${this._document.title}`; };

    private getDescription(): string { return this._document.description; };

    private getFields(): APIEmbedField[] {
        const fields: APIEmbedField[] = [];
        let info: string = `\u200b • Stage: \`${this._document.stage}\` \u200b \u200b • Votes: **\`${this._document.users.length}\`**`;
        if (this._document.stage === Referendum.Stage.ACTIVE)
            info += `\n\u200b • Started at ${TimeStamp.gen(this._document.startedAt)} - ${TimeStamp.gen(this._document.startedAt, TimeStamp.Flags.R)}`;
        if (this._document.stage === Referendum.Stage.CLOSED)
            info += `\n\u200b • From ${TimeStamp.gen(this._document.startedAt)} to ${TimeStamp.gen(this._document.closedAt)}`;
        info += `\n\u200b • Created by ${atUser(this._document.createdBy)}`;

        fields.push({
            name: 'Information',
            value: info,
            inline: false
        });

        if (this._document.stage === Referendum.Stage.CLOSED) {
            const value = this._document.proposals.map((p, i) => {
                const adv = p.advocates, opo = p.opponents;/* , total = adv + opo */
                const [aP, oP] = a_b_percent(adv, opo, 1);
                return `\u200b • ${p.title}:\n${adv > opo ? '🇵 🅰️ 🇸 🇸' : '🇷 🇪 🇯 🇪 🇨 🇹'}\nAgree \`${adv}\` (${aP}%) -- (${oP}%) \`${opo}\` Disagree`;
            }).join('\n');
            fields.push({
                name: 'Outcome',
                value: value,
                inline: false,
            })
        }

        fields.push(...this._document.proposals.map((proposal, index) => ({
            name: `**${ordinal(index + 1)} proposal**`,
            value: `- Title: ${proposal.title}` +
                `\n- Description: ${proposal.description}` +
                `\n- Purpose: ${proposal.purpose}` +
                `\n- Proposer: ${proposal.proposer}` +
                `\n- Uploader: ${atUser(proposal.uploader)}`,
            inline: true
        })))
        return fields;
    };

    private getFooter(): APIEmbedFooter {
        switch (this._document.stage) {
            case Referendum.Stage.PREPARING:
                return {
                    text: `Use the menus to configure. use /help for more details.`
                };
            case Referendum.Stage.ACTIVE:
                return {
                    text: '' /* `Started at ${TimeStamp.gen(this._document.startedAt)} • ${TimeStamp.gen(this._document.startedAt, TimeStamp.Flags.R)}` */
                };
            case Referendum.Stage.CLOSED:
                return {
                    text: ''
                };
        }
    };

    private getEntitledEmbed(): APIEmbed {
        return {
            color: Colors.Blurple,
            title: 'who can modify?',
            description: `The guy created this: ${atUser(this._document.createdBy)}\n` +
                `Single members: ${this._document.entitled.filter(id => !id.startsWith('&')).map(id => atUser(id)).join(', ')}\n` +
                `Roles: ${this._document.entitled.filter(id => id.startsWith('&')).map(id => atUser(id)).join(', ')}`
        };
    };

    private getCheckListRow(): ActionRowBuilder<StringSelectMenuBuilder> {
        return new ActionRowBuilder<StringSelectMenuBuilder>({})
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(this.assembleId(
                        [Referendum.CustomId.Settings]))
                    .setPlaceholder('Select to modify the contents')
                    .setOptions(...(Array.from(this._checkList.entries())
                        .map(([key, value]) => new StringSelectMenuOptionBuilder()
                            .setLabel(key)
                            .setValue(key)
                        )))
            ]);
    };

    private getPreparingProposalsRow(): ActionRowBuilder<StringSelectMenuBuilder> {
        const options = this._document.proposals
            .map((p, i) => new StringSelectMenuOptionBuilder()
                .setLabel(p.title)
                .setValue(i.toString()));
        if (this._document.proposals.length < Referendum._proposalMaxAmount)
            options.push(new StringSelectMenuOptionBuilder()
                .setLabel('Add New Proposal')
                .setValue('+')
                .setEmoji('🫵')
            );

        return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(this.assembleId([Referendum.CustomId.Proposals]))
                    .setPlaceholder('Select to add, modify or remove')
                    .setOptions(...options)
            ]);
    };

    private getStartButtonRow(): ButtonRow {
        return new ButtonRow([{
            customId: this.assembleId([Referendum.CustomId.Start]),
            style: ButtonStyle.Primary,
            label: 'Start',
            disabled: this._document.proposals.length === 0
        }])
    };

    private getActiveButtonRow(): ButtonRow {
        return new ButtonRow([
            {
                customId: this.assembleId([Referendum.CustomId.Vote]),
                style: ButtonStyle.Primary,
                label: 'Vote',
            }, {
                customId: this.assembleId([Referendum.CustomId.Close, this._document.createdBy]),
                style: ButtonStyle.Secondary,
                label: 'Close'
            }, {
                style: ButtonStyle.Link,
                label: 'Live',
                emoji: '🔴',
                url: 'https://youtu.be/dQw4w9WgXcQ'
            }
        ])
    };

    private getTestButtonRow(): ButtonRow {
        return new ButtonRow([
            {
                customId: this.assembleId(['refresh']),
                style: ButtonStyle.Primary,
                label: 'refresh'
            }, {
                customId: this.assembleId(['reset']),
                style: ButtonStyle.Primary,
                label: 'reset'
            }, {
                customId: this.assembleId(['forward']),
                style: ButtonStyle.Primary,
                label: 'forward'
            }
        ]);
    };

    static getCreationModal(): ModalComponentData {
        return {
            customId: `[Referendum][creation][modal]`,
            title: `Create a Referendum`,
            components: [
                new TextInputRow({
                    label: 'Title', customId: Referendum.OverviewFields.TITLE,
                    required: true, maxLength: 60,
                    style: TextInputStyle.Short,
                    placeholder: 'The main idea:'
                }),
                new TextInputRow({
                    label: 'Description', customId: Referendum.OverviewFields.DESCRIPTION,
                    required: false, maxLength: 600,
                    style: TextInputStyle.Paragraph,
                    placeholder: 'Write about this referendum:'
                })
            ]
        };
    };

    static getDefaultMessage(title: string, description: string = ''): MessageCreateOptions {
        return {
            embeds: [{
                color: Colors.Yellow,
                author: Referendum.getAuthor(),
                title: title,
                description: description,
                footer: Referendum.getDefaultFooter()
            }]
        };
    };

    private static getDefaultFooter(): APIEmbedFooter { return { text: 'Stage: Preparing • idle: 30 min' }; };

    private assembleId = (terms: string[]) => {
        terms.unshift(Referendum.CustomId.Referendum);
        terms.push(this._document._id.toString());
        return terms.map(term => `[${term}]`).join('');
    };

    setMessage(message: Message): void {
        this._document.guildId = message.guildId as string;
        this._document.message.channelId = message.channelId;
        this._document.message.messageId = message.id;
    };

    getModifyOverviewModal(): ModalComponentData {
        return {
            title: 'Modify the Title & Description',
            customId: this.assembleId([Referendum.CustomId.SubmitModification]),
            components: [
                new TextInputRow({
                    label: 'Title', customId: Referendum.OverviewFields.TITLE,
                    required: true, maxLength: 80,
                    style: TextInputStyle.Short,
                    placeholder: 'The main idea:',
                    value: this._document.title
                }),
                new TextInputRow({
                    label: 'Description', customId: Referendum.OverviewFields.DESCRIPTION,
                    required: false, maxLength: 1000,
                    style: TextInputStyle.Paragraph,
                    placeholder: 'Write about this referendum:',
                    value: this._document.description
                })],
        };
    };

    getModifyProposalModal(action: string): ModalComponentData {
        let index = Number(action);
        if (action !== '+' && (index < 0 || index > Referendum._proposalMaxAmount))
            throw new Error('Bad Proposal Code');
        return {
            customId: this.assembleId([Referendum.CustomId.SubmitProposal, action]),
            title: `${action === '+' ? 'Create a' : 'Modify'} proposal`,
            components: [
                new TextInputRow({
                    customId: Referendum.ProposalFields.TITLE,
                    label: 'Title',
                    maxLength: 50,
                    placeholder: '⚠️ QUIT to CANCEL | LEAVE BLANK to DELETE ⚠️',
                    required: false,
                    style: TextInputStyle.Short,
                    value: action !== '+' ? (this._document.proposals[index]?.title || '') : ''
                }),
                new TextInputRow({
                    customId: Referendum.ProposalFields.DESCRIPTION,
                    label: 'Description',
                    maxLength: 300,
                    placeholder: 'The detail of this proposal.',
                    required: false,
                    style: TextInputStyle.Paragraph,
                    value: action !== '+' ? (this._document.proposals[index]?.description || '') : ''
                }),
                new TextInputRow({
                    customId: Referendum.ProposalFields.PURPOSE,
                    label: 'Purpose',
                    maxLength: 300,
                    placeholder: 'Why you made such a proposal?',
                    required: false,
                    style: TextInputStyle.Paragraph,
                    value: action !== '+' ? (this._document.proposals[index]?.purpose || '') : ''
                }),
                new TextInputRow({
                    customId: Referendum.ProposalFields.PROPOSER,
                    label: 'Proposer',
                    maxLength: 25,
                    placeholder: 'Who purposed this.',
                    required: false,
                    style: TextInputStyle.Short,
                    value: action !== '+' ? (this._document.proposals[index]?.proposer || '') : ''
                }),
            ]
        };
    };

    static Voter = class {
        private _id: string;
        static time: number = 6 * 60 * 1000;
        static idle: number = 2 * 60 * 1000;
        submit: boolean = false;
        proposals: {
            title: string,
            choice: Referendum.Ballot
        }[];
        selected: number = -1;
        uuid: string;

        constructor(id: string, proposals: Referendum.Proposal[]) {
            this._id = id;
            this.uuid = uuidv4();
            this.proposals = proposals.map(proposal => ({
                title: proposal.title,
                choice: Referendum.Ballot.NUETRAL
            }));
        };

        getMessage(): InteractionReplyOptions & InteractionUpdateOptions {
            return {
                ephemeral: true,
                embeds: [this.getMainEmbed()],
                components: this.getPanel()
            };
        };

        private getMainEmbed(): APIEmbed {
            return {
                color: this.submit ? Colors.DarkGold : Colors.DarkPurple,
                title: this.submit ? 'Confirm submission' : '',
                author: { name: 'Referendum Voter (alpha)' },
                fields: this.proposals.map(proposal => ({
                    name: proposal.title,
                    value: proposal.choice,
                    inline: true
                })),
                footer: { text: `time limit: ${x_min_y_sec(Referendum.Voter.time)} ● idle: ${x_min_y_sec(Referendum.Voter.idle)}` }
            };
        };

        private getPanel(): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
            return this.submit ? [this.getConfirmBtn()] : [this.getSelector(), this.getBallotBtn(), this.getSubmitBtn()];
        };

        private getSelector(): ActionRowBuilder<StringSelectMenuBuilder> {
            return new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(new StringSelectMenuBuilder()
                    .setCustomId('$select')
                    .setPlaceholder('Select to make your choice')
                    .setOptions(...this.proposals
                        .map((p, i) => new StringSelectMenuOptionBuilder()
                            .setLabel(p.title)
                            .setValue(i.toString())
                            .setDefault(i === this.selected))));
        };

        private getBallotBtn(): ActionRowBuilder<ButtonBuilder> {
            return new ButtonRow([{
                customId: '$A',
                label: 'AGREE',
                style: ButtonStyle.Success,
                disabled: !(this.selected > -1 &&
                    this.proposals[this.selected].choice !== Referendum.Ballot.AGREE)
            }, {
                customId: '$N',
                label: 'NEUTRAL',
                style: ButtonStyle.Primary,
                disabled: !(this.selected > -1 &&
                    this.proposals[this.selected].choice !== Referendum.Ballot.NUETRAL)
            }, {
                customId: '$D',
                label: 'DISAGREE',
                style: ButtonStyle.Danger,
                disabled: !(this.selected > -1 &&
                    this.proposals[this.selected].choice !== Referendum.Ballot.DISAGREE)
            }]);
        };

        private getSubmitBtn(): ButtonRow {
            return new ButtonRow([{
                customId: '$S',
                label: 'Submit',
                style: ButtonStyle.Secondary
            }]);
        };

        private getConfirmBtn(): ButtonRow {
            return new ButtonRow([{
                customId: '$X',
                label: 'Cancel',
                style: ButtonStyle.Secondary
            }, {
                customId: '$O',
                label: 'Confirm',
                style: ButtonStyle.Primary
            }]);
        };

        genIncObj(): { [key: string]: number } {
            const obj: { [key: string]: number } = {};
            this.proposals.forEach((p, i) => {
                if (p.choice !== Referendum.Ballot.NUETRAL)
                    obj[`proposals.${i}.${p.choice === Referendum.Ballot.AGREE ? 'advocates' : 'opponents'}`] = 1;
            })
            return obj;
        }
    };
};

export namespace Referendum {
    export enum OverviewFields {
        TITLE = 'title',
        DESCRIPTION = 'desc'
    };

    export enum ProposalFields {
        TITLE = 'TITLE',
        DESCRIPTION = 'DESCRIPTION',
        PURPOSE = 'PURPOSE',
        PROPOSER = 'PROPOSER'
    };

    export enum Ballot {
        AGREE = 'AGREE',
        DISAGREE = 'DISAGREE',
        NUETRAL = 'NUETRAL'
    };

    export enum CheckList {
        Title_Description = 'Title_Description',
        Entitled = 'Entitle',
    };

    export enum CustomId {
        Referendum = 'Referendum',
        Creation = 'Creation',
        Proposals = 'Proposals',
        Settings = 'Settings',
        SubmitModification = 'SubmitModification',
        SubmitProposal = 'SubmitProposal',
        Start = 'Start',
        Vote = 'Vote',
        Close = 'Close'
    };

    export enum Stage {
        PREPARING = 'PREPARING',
        ACTIVE = 'ACTIVE',
        CLOSED = 'CLOSED'
    };

    export interface Proposal {
        title: string;
        description: string;
        purpose: string;
        proposer: string;
        uploader: Snowflake;
        advocates: number;
        opponents: number;
    }
};
