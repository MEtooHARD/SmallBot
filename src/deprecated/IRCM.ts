// import { BaseInteraction, Message } from "discord.js";
// import { fUCKoFF } from "../commands/msg/commands/fUCKoFF";
// import { quit } from "../commands/msg/commands/quit";
// import { say } from "../commands/msg/commands/say";
// import { tryCatch } from "./Basic/GeneralTypes";
// import { MessageCommand, Report } from "./MessageFeature";

// const MCommands: MessageCommand[] = (() => {
//     const list = [say];
//     return list;
// })();

// const DMCommands: MessageCommand[] = [
//     quit, fUCKoFF,
// ]

// class IncomingChannelResourceManager {

//     public static onInteraction(interaction: BaseInteraction) {
//     }

//     public static async onMessage(message: Message): Promise<Report> {
//         const [commandInfo, error] = MessageCommand.parseCommand(message.content);
//         if (commandInfo === null) { // non-command
//             return {
//                 handled: true,
//                 success: true
//             }
//         } else { // command
//             const command = commandInfo.level === 'general'
//                 ? MCommands.find(cmd => cmd.name === commandInfo?.command)
//                 : DMCommands.find(cmd => cmd.name === commandInfo?.command);
//             if (command) { // valid command
//                 if (command.param.required && commandInfo.params.length === 0) {
//                     tryCatch(message.reply({
//                         content: `This command requires some parameters: \n${command.param.pattern}`
//                     }));
//                     return {
//                         handled: true,
//                         success: true,
//                     };
//                 }
//                 return command.exe(message, commandInfo);
//             } else {  // invalid command
//                 tryCatch(message.reply({ content: `Unknown command: ${commandInfo.command}` }));
//                 return {
//                     handled: true,
//                     success: true,
//                 };

//             }
//         }
//     }
// }

// export const ICRM = IncomingChannelResourceManager;