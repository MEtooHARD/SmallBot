import mongoose, { Schema } from "mongoose";
import { IVote } from "../classes/Vote";

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
    createdIn: { type: String, required: true, index: true }, // Snowflake (guild)
    createdAt: { type: Number, default: Date.now, index: true },
    createdBy: { type: String, required: true }, // Snowflake (user)
    duration: { type: Number, default: 0 },  // milliseconds
    latestVote: { type: Number, default: 0 },
    closed: { type: Boolean, default: false },
}, {
    collection: 'VoteSchema'
});

export const VoteModel = mongoose.model('VoteModel', VoteSchema);