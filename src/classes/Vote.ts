import { APIEmbedField, Snowflake } from 'discord.js';
import { Document } from 'mongoose';

// Define the interface for the Vote schema
export interface IVote extends Document {
    title: string;
    description: string;
    options: [{
        name: string;
        value: string;
        proponents: string[]; // snowflake (user)[]
        count: number;
    }];
    maxSelect: number,
    createdAt: number;
    createdBy: string; // Snowflake (user)
    createdIn: string; // Snowflake (guild)
    duration: number;  // milliseconds
    global: boolean;
    latestVote: number;
    closed: boolean;
};

export class Vote {
    document: IVote;

    constructor(doc: IVote) { this.document = doc; };

    get author(): string { return 'SmallBot Vote alpha'; };

    get title(): string { return this.document.title; };

    get description(): string { return this.document.description; };

    get fields(): APIEmbedField[] {
        return this.document.options
            .map(option => ({
                name: option.name,
                value: `\`${option.count}\` votes.\n${option.value}`
            }));
    };

    handleVote(indices: number[], UID: Snowflake): void {
        if (this.document.maxSelect === 1) {
            const toUnvote = this.findVoted(UID)[0] || -1;
            if (toUnvote !== indices[0]) {
                this.unvote(toUnvote, UID);
                this.vote(indices[0], UID);
            }
        } else {
            const toUnvote = this.findVoted(UID).filter(i => !indices.includes(i));
            const toVote = indices.filter(i => !toUnvote.includes(i));

            toUnvote.forEach(i => this.unvote(i, UID));
            toVote.forEach(i => this.vote(i, UID));
        }
    }

    vote(index: number, UID: Snowflake): void {
        if (index < 0) return;
        if (!this.isVoted(index, UID)) {
            this.document.options[index].proponents.push(UID);
            this.document.options[index].count++;
        }
    };

    unvote(index: number, UID: Snowflake): void {
        if (index < 0) return;
        const userIndex = this.document.options[index].proponents.indexOf(UID);
        if (userIndex > -1) {
            this.document.options[index].proponents.splice(userIndex, 1);
            this.document.options[index].count--;
        }
    };

    isVoted(index: number, UID: Snowflake): boolean {
        return this.document.options[index].proponents.includes(UID);
    }

    findVoted(UID: Snowflake): number[] {
        return this.document.options
            .map((option, index) => (this.isVoted(index, UID) ? index : -1))
            .filter(index => index !== -1);
    }
};