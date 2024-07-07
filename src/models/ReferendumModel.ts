import mongoose, { Schema } from "mongoose";
import { IReferendum } from "../classes/Referendum";
import { ActivityStage } from "../classes/Activity";

const ReferendumSchema: Schema<IReferendum> = new Schema({
    title: { type: String, required: true },
    topics: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        proponents: { type: Number, default: 0 },
        opponents: { type: Number, default: 0 },
        spoiled: { type: Number, default: 0 }
    }],
    users: [{ type: String, required: true }],
    description: { type: String, default: '', index: true },
    startTime: { type: Number, required: true, index: true },
    createdAt: { type: Number, default: Date.now },
    createdBy: { type: String, required: true }, // Snowflake (user)
    createdIn: { type: String, required: true, index: true }, // Snowflake (guild)
    duration: { type: Number, default: 0 },  // milliseconds
    global: { type: Boolean, default: false, index: true },
    lastVoted: { type: Number, default: 0 },
    stage: { type: String, default: ActivityStage.PREPARING },
}, {
    collection: 'ReferendumSchema'
});

export const VoteModel = mongoose.model('ReferendumModel', ReferendumSchema);