import { GuildMember } from "discord.js";

const handleMemberAdd = (member: GuildMember) => {
  if (member.guild.systemChannel)
    member.guild.systemChannel.send('真真高興地見到你||（棒讀||');
}

export = handleMemberAdd;