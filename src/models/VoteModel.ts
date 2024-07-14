import mongoose, { Schema } from "mongoose";
import { IVote } from "../classes/Vote";
import { ActivityStage } from "../classes/Activity";

const VoteSchema: Schema<IVote> = new Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    options: [{
        name: { type: String, required: true },
        value: { type: String, default: '' },
        count: { type: Number, default: 0 },
        proponents: [{ type: String, required: true }] // snowflake (user)[]
    }],
    maxSelect: { type: Number, default: 1 },
    global: { type: Boolean, default: false, index: true },
    startTime: { type: Number, required: true },
    createdIn: { type: String, required: true, index: true }, // Snowflake (guild)
    createdAt: { type: Number, default: Date.now, index: true },
    createdBy: { type: String, required: true }, // Snowflake (user)
    duration: { type: Number, default: 0 },  // milliseconds
    lastVoted: { type: Number, default: 0 },
    stage: { type: String, default: ActivityStage.PREPARING },
}, {
    collection: 'VoteSchema'
});

export const VoteModel = mongoose.model('VoteModel', VoteSchema);