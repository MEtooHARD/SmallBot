// import { on } from "../../app";
// import { Events, VoiceState } from "discord.js";
// import update from "../../handleEvent/voiceStateUpdate";
// import { Report } from "../../classes/MessageFeature";

// const voiceStateUpdate = () => {
//     on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState): Promise<Report> => {
//         await update(oldState, newState);
//         return {
//             handled: true,
//             success: true,
//         };
//     });
// }


// export = voiceStateUpdate;