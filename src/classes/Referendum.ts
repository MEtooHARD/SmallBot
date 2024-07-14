import { APIEmbedField, APIEmbedFooter, ModalComponentData, Snowflake, TextInputStyle } from "discord.js";
import { ActivityStage } from "./Activity";
import { Document } from "mongoose";
import { TextInputRow } from "./ActionRow/Modal";
import { ordinal } from "../functions/general/number";
import { atUser, timestamp } from "../functions/discord/mention";

interface Item {
    name: string;
    check: boolean;
};

const CheckList: string[] = [
    'title',
    'description',
    'global',
    'startTime',
    'endTime',
    'stage',
];

export enum ReferendumModalFieldsCustomID {
    TITLE = 'title',
    DESCRIPTION = 'desc'
};

export enum ReferendumBallot {
    ADVOCATE = 'ADVOCATE',
    OPPONENT = 'OPPONENT',
    NUETRAL = 'NUETRAL'
};

export interface UserInfo {
    id: Snowflake;
    username: string;
    displayname?: string;
};

export interface IReferendum extends Document {
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    stage: ActivityStage;
    createdBy: UserInfo;
    entitled: [Snowflake],
    users: [Snowflake];
    message: {
        channelId: Snowflake;
        messageId: Snowflake;
    };
    proposals: [{
        title: string;
        description: string;
        purpose: string;
        proposer: UserInfo;
        uploader: UserInfo;
        advocates: number;
        opponents: number;
    }];
};

export class Referendum {
    private _document: IReferendum;
    private _checkList: Item[] = CheckList.map(name => ({ name: name, check: false }));

    constructor(doc: IReferendum) { this._document = doc; };

    get author(): string { return 'SmallBot Referendum alpha'; };

    get title(): string { return this._document.title; };

    get description(): string { return this._document.description; };

    get fields(): APIEmbedField[] {
        return this._document.proposals.map((proposal, index) => ({
            name: ordinal(index),
            value: `> **${proposal.title} proposal**` +
                `\n> Description: ${proposal.description}` +
                `\n> Proposer: ${proposal.proposer}` +
                `\n> Uploader: ${proposal.uploader.username} (${atUser(proposal.uploader.id)})`,
            inline: true
        }));
    };

    get footer(): APIEmbedFooter {
        return {
            text: `Started at: ${timestamp(this._document.startTime)}`
        };
    };

    static get creationModal(): ModalComponentData {
        return {
            customId: '[Referendum][creation][modal]',
            title: 'Create a Referendum',
            components: [
                new TextInputRow({
                    label: 'Title', customId: ReferendumModalFieldsCustomID.TITLE,
                    required: true, maxLength: 80,
                    style: TextInputStyle.Short,
                    placeholder: 'The main idea:'
                }),
                new TextInputRow({
                    label: 'Description', customId: ReferendumModalFieldsCustomID.DESCRIPTION,
                    required: true, maxLength: 500,
                    style: TextInputStyle.Paragraph,
                    placeholder: 'Write about this referendum:'
                })
            ]
        };
    };
};