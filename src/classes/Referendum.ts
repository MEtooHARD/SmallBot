import { APIEmbedField, APIEmbedFooter, ModalComponentData, Snowflake, TextInputStyle } from "discord.js";
import { ActivityStage } from "./Activity";
import { Document } from "mongoose";
import { TextInputRow } from "./ActionRow/Modal";
import { ordinal } from "../functions/general/number";
import { atUser, timestamp } from "../functions/discord/mention";

export enum ReferendumBallot {
    ADVOCATE = 'ADVOCATE',
    OPPONENT = 'OPPONENT',
    NUETRAL = 'NUETRAL'
};

export interface UserInfo {
    id: Snowflake;
    name: string;
}

export interface GuildInfo {
    id: Snowflake,
    name: string
}

export interface IReferendum extends Document {
    title: string;
    proposals: [{
        title: string;
        description: string;
        reason: string;
        proposer: string;
        uploader: UserInfo;
        advocates: number;
        opponents: number;
        spoiled: number;
    }];
    guilds: [{
        guildId: string,
        channelId: string,
        messageId: string
    }];
    users: Snowflake;
    description: string;
    startTime: number;
    // createdAt: number;
    createdBy: UserInfo;
    createdIn: string;
    duration: number;
    global: boolean;
    lastVoted: number;
    stage: ActivityStage;
};

export class Referendum {
    document: IReferendum;

    constructor(doc: IReferendum) { this.document = doc; };

    get author(): string { return 'SmallBot Referendum alpha'; };

    get title(): string { return this.document.title; };

    get description(): string { return this.document.description; };

    get fields(): APIEmbedField[] {
        return this.document.proposals.map((proposal, index) => ({
            name: ordinal(index),
            value: `> **${proposal.title} proposal**` +
                `\n> Description: ${proposal.description}` +
                `\n> Proposer: ${proposal.proposer}` +
                `\n> Uploader: ${proposal.uploader.name} (${atUser(proposal.uploader.id)})`,
            inline: true
        }));
    };

    get footer(): APIEmbedFooter {
        return {
            text: `Started at: ${timestamp(this.document.startTime)}`
        };
    };


    static get creationModal(): ModalComponentData {
        return {
            customId: '[Referendum][creation][modal]',
            title: 'Create a Referendum',
            components: [
                new TextInputRow({
                    label: 'Title', customId: 'title',
                    required: true, maxLength: 80,
                    style: TextInputStyle.Short,
                    placeholder: 'The main idea:'
                }),
                new TextInputRow({
                    label: 'Description', customId: 'desc',
                    required: true, maxLength: 500,
                    style: TextInputStyle.Paragraph,
                    placeholder: 'Write about this referendum:'
                })
            ]
        };
    };
};