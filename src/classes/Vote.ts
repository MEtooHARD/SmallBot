import { APIEmbedAuthor, APIEmbedField, APIEmbedFooter, ModalComponentData, Snowflake, TextInputStyle } from 'discord.js';
import { Document } from 'mongoose';
import { ActivityStage } from './Activity';
import { TextInputRow } from './ActionRow/Modal';
import { EventEmitter } from 'node:events';

class test extends EventEmitter {
    constructor() {
        super();
        // this.

        const gg = new EventEmitter();
        gg
    }
}

class VoteCounter {
    _id: string;
    map: Map<string, VoteCounter>;
    count: number = 0;
    timer: NodeJS.Timeout | undefined;

    constructor(_id: string, map: Map<string, VoteCounter>) {
        this._id = _id;
        this.map = map;
        this.setupTimer();
    }

    setupTimer() {
        if (this.count === 0 && this.timer) {
            console.log(`VoteCounter ${this._id} is idle`); // will use the actual update function later
            this.map.delete(this._id);
        } else {
            this.count = 0;
            this.timer = setTimeout(() => this.setupTimer(), 3000);
        }
    }
}

export class VoteManager extends EventEmitter {
    votes: Map<string, VoteCounter>;

    constructor() {
        super();
        this.votes = new Map<string, VoteCounter>();
    };

    handleVote(_id: string): void {
        const vote = this.votes.get(_id);
        if (vote)
            vote.count++;
        else
            this.votes.set(_id, new VoteCounter(_id, this.votes));
    }

    newVote(_id: string): void {
        // @ts-ignore
        this.emit();
    }
};

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
    maxSelect: number;
    startTime: number;
    createdAt: number;
    createdBy: string; // Snowflake (user)
    createdIn: string; // Snowflake (guild)
    duration: number;  // milliseconds
    global: boolean;
    lastVoted: number;
    stage: ActivityStage;
    guilds: [{
        guildId: Snowflake,
        channelId: Snowflake,
        messageID: Snowflake
    }];
};

export class Vote {
    document: IVote;

    constructor(doc: IVote) { this.document = doc; };

    get author(): APIEmbedAuthor {
        return {
            name: 'SmallBot Vote alpha',
        };
    };

    get title(): string { return this.document.title; };

    get description(): string { return this.document.description; };

    get fields(): APIEmbedField[] {
        return this.document.options
            .map(option => ({
                name: option.name,
                value: `\`${option.count}\` votes.\n${option.value}`
            }));
    };

    get footer(): APIEmbedFooter {
        return {
            text: this.document.stage,
        };
    };

    handleVote(indices: number[], UID: Snowflake): void {
        if (this.document.maxSelect === 1) {
            const toUnvote = this.findVoted(UID)[0] || -1;
            if (toUnvote !== indices[0]) {
                this.unvote(toUnvote, UID);
                this.vote(indices[0], UID);
                this.document.markModified('options');
            }
        } else {
            const toUnvote = this.findVoted(UID).filter(i => !indices.includes(i));
            const toVote = indices.filter(i => !toUnvote.includes(i));

            toUnvote.forEach(i => this.unvote(i, UID));
            toVote.forEach(i => this.vote(i, UID));
        }
    };

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
    };

    findVoted(UID: Snowflake): number[] {
        return this.document.options
            .map((option, index) => (this.isVoted(index, UID) ? index : -1))
            .filter(index => index !== -1);
    };

    static creationModal(): ModalComponentData {
        return {
            customId: '[Vote][creation][modal]',
            title: 'Creat a Vote',
            components: [
                new TextInputRow({
                    label: 'Title', customId: 'title',
                    required: true, maxLength: 60,
                    style: TextInputStyle.Short,
                    placeholder: 'Write the main topic of this Vote:'
                }),
                new TextInputRow({
                    label: 'Description', customId: 'description',
                    required: true, maxLength: 500,
                    style: TextInputStyle.Short,
                    placeholder: 'Give some description \'bout this Vote: '
                }),
                new TextInputRow({
                    label: 'Options', customId: 'options',
                    required: true, maxLength: 350,
                    style: TextInputStyle.Paragraph,
                    placeholder: ''
                })
            ]
        }
    }
};