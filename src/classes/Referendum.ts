import { APIEmbedField, Snowflake } from "discord.js";
import { ActivityStage } from "./Activity";
import { Document } from "mongoose";

export interface IReferendum extends Document {
    title: string;
    topics: [{
        title: string;
        description: string;
        proponents: number;
        opponents: number;
        spoiled: number;
    }];
    users: Snowflake;
    description: string;
    startTime: number;
    createdAt: number;
    createdBy: string;
    createdIn: string;
    duration: number;
    global: boolean;
    lastVoted: number;
    stage: ActivityStage;
};

export class Referendum {
    document: IReferendum;

    constructor(doc: IReferendum) { this.document = doc; };

    get author(): string { return 'SmallBot Vote alpha'; };

    get title(): string { return this.document.title; };

    get description(): string { return this.document.description; }

    get fields(): APIEmbedField[] {
        return [];
    }


}