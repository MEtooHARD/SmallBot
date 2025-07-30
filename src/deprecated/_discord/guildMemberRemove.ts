// import { on } from '../../app';
// import { Events, GuildMember } from 'discord.js';
// import handleMemberRemove from '../../handleEvent/guildMemberRemove';
// import { Report } from '../../classes/MessageFeature';

// const memberRemove = () => {
//     on(Events.GuildMemberRemove, async (member: GuildMember): Promise<Report> => {
//         await handleMemberRemove(member);
//         return {
//             handled: true,
//             success: true,
//         };
//     });
// }

// export = memberRemove;