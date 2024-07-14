import mongoose, { Schema } from "mongoose";
import { IReferendum } from "../classes/Referendum";
import { ActivityStage } from "../classes/Activity";

const StringRequired = { type: String, required: true };

const UserInfo = { id: StringRequired, username: StringRequired, displayname: { type: String, default: '' } };

const NumberDefault = { type: Number, default: 0 };

const ReferendumSchema: Schema<IReferendum> = new Schema({
    title: StringRequired,
    description: { type: String, default: '', index: true },
    stage: { type: String, default: ActivityStage.BASICSETTING },
    startTime: { type: Number, required: true, index: true },
    endTime: NumberDefault,
    createdBy: StringRequired,
    users: [StringRequired],
    message: {
        channelId: StringRequired,
        messageId: StringRequired
    },
    proposals: [{
        title: StringRequired,
        description: StringRequired,
        purpose: StringRequired,
        proposer: UserInfo,
        proponents: NumberDefault,
        opponents: NumberDefault,
        uploader: UserInfo,
    }]
}, {
    collection: 'ReferendumSchema'
});

export const ReferendumModel = mongoose.model('ReferendumModel', ReferendumSchema);