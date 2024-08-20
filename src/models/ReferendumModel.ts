import mongoose, { Schema } from "mongoose";
import { IReferendum, Referendum } from "../classes/Referendum";

const StringRequired = { type: String, required: true };

// const UserInfo = { id: StringRequired, username: StringRequired, displayname: { type: String, default: '' } };

const NumberDefault = { type: Number, default: 0 };

const ReferendumSchema: Schema<IReferendum> = new Schema({
  title: StringRequired,
  description: { type: String, default: '', index: true },
  startedAt: NumberDefault,
  closedAt: NumberDefault,
  stage: { type: String, default: Referendum.Stage.PREPARING },
  createdBy: StringRequired,
  guildId: StringRequired,
  message: {
    channelId: StringRequired,
    messageId: StringRequired
  },
  entitled: [{ type: String }],
  users: { type: [StringRequired], default: [] },
  sessions: { type: Map, of: String },
  proposals: {
    type: [{
      title: StringRequired,
      description: StringRequired,
      purpose: StringRequired,
      proposer: StringRequired,
      uploader: StringRequired,
      advocates: NumberDefault,
      opponents: NumberDefault,
    }],
    default: []
  }
}, {
  collection: 'Referendum'
});

export const ReferendumModel = mongoose.model('ReferendumModel', ReferendumSchema);