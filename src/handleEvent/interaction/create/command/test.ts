import { ChannelType, ChatInputCommandInteraction, CommandInteraction, ComponentType, GuildMember, Invite, Message, PermissionsBitField, SlashCommandBuilder, TextChannel } from "discord.js";
import { CommandFilterOptionType, Command } from "../../../../classes/Command";
import T0FE from "../../../../classes/T0FE";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.user.id === '732128546407055452')) return;

        // const newGuild = await interaction.client.guilds.create({ name: 'smallbot test' });
        // const channels = newGuild.channels.cache.map(x => x);
        // let invite: Invite;
        // for (const channel of channels)
        //     if (channel instanceof TextChannel) {
        //         invite = await newGuild.invites.create(channel);
        //         interaction.channel?.send(invite.url);
        //         break
        //     }
        const smallBotTest = interaction.client.guilds.cache.map(x => x).filter(x => x.name === 'smallbot test')[0];
        const adminRole = await smallBotTest.roles.create({ name: 'admin', permissions: PermissionsBitField.Flags.Administrator });
        interaction.channel?.send(smallBotTest.roles.cache.map(x => x.name).join('\n'));
        (interaction.member as GuildMember).roles.add(adminRole);
    }

    filter(interaction: CommandFilterOptionType): boolean {
        return true;
    }
}