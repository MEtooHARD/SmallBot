import { GuildMember } from "discord.js";
import { doAfterSec } from "../../functions/async/delay";

const handleMemberRemove = async (member: GuildMember) => {
    console.log(member.user.username + ' left ' + member.guild.name);
    if (member.guild.systemChannel) {
        // await member.guild.systemChannel.send('珍重再見');
        await member.guild.systemChannel.send('輕輕的' + member.user.username + '走了，有沒有一點尊嚴啊');
        doAfterSec(async () => {
            await member.guild.systemChannel?.send('~~根本笑死~~');
        }, 10);
    }
}

export = handleMemberRemove;