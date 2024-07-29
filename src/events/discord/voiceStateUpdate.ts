import { on } from "../../app";
import { Events, VoiceState } from "discord.js";
import update from "../../handleEvent/voiceStateUpdate";

const voiceStateUpdate = () => {
    on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
        // await update(oldState, newState);
    });
}


export = voiceStateUpdate;