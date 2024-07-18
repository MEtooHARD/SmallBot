import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, ButtonStyle, Colors, GuildMember, Message, MessageCreateOptions, MessageEditOptions, ModalComponentData, Snowflake, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputStyle, User } from "discord.js";
import { Document, Types } from "mongoose";
import { TextInputRow } from "./ActionRow/Modal";
import { ordinal } from "../functions/general/number";
import { TimeStamp, atUser } from "../functions/discord/mention";
import { ActionRowBuilder } from "@discordjs/builders";
import { overlap } from "../functions/general/array";
import { Button } from "./ActionRow/Button";
import ButtonRow from "./ActionRow/ButtonRow";

export interface UserInfo {
    id: Snowflake;
    username: string;
    displayname?: string;
};

export interface IReferendum extends Document {
    _id: Types.ObjectId,
    title: string;
    description: string;
    startedAt: number;
    closedAt: number;
    stage: Referendum.Stage;
    createdBy: Snowflake;
    message: {
        channelId: Snowflake;
        messageId: Snowflake;
    };
    entitled: Snowflake[];
    users: Snowflake[];
    proposals: {
        title: string;
        description: string;
        purpose: string;
        proposer: string;
        uploader: Snowflake;
        advocates: number;
        opponents: number;
    }[];
};

export class Referendum {
    private _document: IReferendum;
    private _checkList: Map<Referendum.CheckList, boolean> = new Map<Referendum.CheckList, boolean>(
        Object.keys(Referendum.CheckList)
            .map(key => [Referendum.CheckList[key as keyof typeof Referendum.CheckList], false])
    );
    static _proposalAmount: number = 6;

    constructor(doc: IReferendum) {
        this._document = doc;
    };

    save(): Promise<IReferendum> { return this._document.save(); };

    getMessage(): MessageCreateOptions & MessageEditOptions {
        const embeds = [this.getMainEmbed()];
        if (this._document.stage === Referendum.Stage.PREPARING) embeds.push(this.getEntitledEmbed());

        const components = [];
        if (this._document.stage === Referendum.Stage.PREPARING)
            components.push(this.getCheckListRow());
        components.push(this.getProposalsRow());
        components.push(new ButtonRow([this.getStartButton()]));

        return {
            embeds: embeds,
            components: components
        };
    };

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

    private getTitle(): string { return this._document.title; };

    private getDescription(): string { return this._document.description; };

    private getFields(): APIEmbedField[] {
        return this._document.proposals.map((proposal, index) => ({
            name: `**${ordinal(index + 1)} proposal**`,
            value: `> Title: ${proposal.title}` +
                `\n\n- Description: ${proposal.description}` +
                `\n- Purpose: ${proposal.purpose}` +
                `\n- Proposer: ${proposal.proposer}` +
                `\n- Uploader: ${atUser(proposal.uploader)}`,
            inline: true
        }));
    };

    private getFooter(): APIEmbedFooter {
        switch (this._document.stage) {
            case Referendum.Stage.PREPARING:
                return {
                    text: `Use the menus to configure. use /help for more details.\nStage: ${this._document.stage}`
                };
            case Referendum.Stage.ACTIVE:
                return {
                    text: `Started at ${TimeStamp.gen(this._document.startedAt)} • ${TimeStamp.gen(this._document.startedAt, TimeStamp.Flags.R)}`
                };
            case Referendum.Stage.CLOSED:
                return {
                    text: `Closed at ${TimeStamp.gen(this._document.closedAt)}`
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
                    .setCustomId(this.assembleId(false,
                        [Referendum.CustomId.Settings]))
                    .setPlaceholder('Select to modify the contents')
                    .setOptions(...(Array.from(this._checkList.entries())
                        .map(([key, value]) => new StringSelectMenuOptionBuilder()
                            .setLabel(key)
                            .setValue(key)
                        )))
            ]);
    };

    private getProposalsRow(): ActionRowBuilder<StringSelectMenuBuilder> {
        const options = this._document.proposals
            .map((p, i) => new StringSelectMenuOptionBuilder()
                .setLabel(p.title)
                .setValue(i.toString()));
        if (this._document.proposals.length < Referendum._proposalAmount)
            options.push(new StringSelectMenuOptionBuilder()
                .setLabel('Add New Proposal')
                .setValue('+')
                .setEmoji('🫵')
            );

        return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(this.assembleId(false, [Referendum.CustomId.Proposals]))
                    .setPlaceholder('Select to add, modify or remove')
                    .setOptions(...options)
            ]);
    };

    private getStartButton(): Button {
        return new Button({
            customId: this.assembleId(false, [Referendum.CustomId.Start]),
            style: ButtonStyle.Primary,
            label: 'Start',
            disabled: this._document.proposals.length === 0
        })
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

    private assembleId = (ignore: boolean, terms: string[]) => {
        terms.unshift(Referendum.CustomId.Referendum);
        terms.push(this._document._id.toString());
        return (ignore ? '$' : '') + terms.map(term => `[${term}]`).join('');
    };

    setMessage(message: Message): void {
        this._document.message.channelId = message.channelId;
        this._document.message.messageId = message.id;
    };

    getModifyOverviewModal(): ModalComponentData {
        return {
            title: 'Modify the Title & Description',
            customId: this.assembleId(false, [Referendum.CustomId.SubmitModification]),
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
        if (action !== '+' && (index < 0 || index > Referendum._proposalAmount))
            throw new Error('Bad Proposal Code');
        return {
            customId: this.assembleId(false, [Referendum.CustomId.SubmitProposal, action]),
            title: `${action === '+' ? 'Create a' : 'Modify'} proposal`,
            components: [
                new TextInputRow({
                    customId: Referendum.ProposalFields.TITLE,
                    label: 'Title',
                    maxLength: 75,
                    placeholder: '⚠️ QUIT to CANCEL | LEAVE BLANK to DELETE ⚠️',
                    required: false,
                    style: TextInputStyle.Short,
                    value: action !== '+' ? (this._document.proposals[index]?.title || '') : ''
                }),
                new TextInputRow({
                    customId: Referendum.ProposalFields.DESCRIPTION,
                    label: 'Description',
                    maxLength: 400,
                    placeholder: 'The detail of this proposal.',
                    required: false,
                    style: TextInputStyle.Paragraph,
                    value: action !== '+' ? (this._document.proposals[index]?.description || '') : ''
                }),
                new TextInputRow({
                    customId: Referendum.ProposalFields.PURPOSE,
                    label: 'Purpose',
                    maxLength: 200,
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

    export enum BallotType {
        ADVOCATE = 'ADVOCATE',
        OPPONENT = 'OPPONENT',
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
        Start = 'Start'
    };

    export enum Stage {
        PREPARING = 'PREPARING',
        ACTIVE = 'ACTIVE',
        CLOSED = 'CLOSED'
    };
};