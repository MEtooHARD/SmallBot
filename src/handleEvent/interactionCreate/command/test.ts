import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.user.id === '732128546407055452')) return;
        interaction.reply({
            embeds: [
                {
                    fields: [
                        {
                            name: 'test',
                            value: '```test```'
                        }
                    ]
                }
            ]
        })
        // const newGuild = await interaction.client.guilds.create({ name: 'smallbot test' });
        // const channels = newGuild.channels.cache.map(x => x);
        // let invite: Invite;
        // for (const channel of channels)
        //     if (channel instanceof TextChannel) {
        //         invite = await newGuild.invites.create(channel);
        //         interaction.channel?.send(invite.url);
        //         break
        //     }
        // const smallBotTest = interaction.client.guilds.cache.map(x => x).filter(x => x.name === 'smallbot test')[0];
        // const adminRole = await smallBotTest.roles.create({ name: 'admin', permissions: PermissionsBitField.Flags.Administrator });
        // interaction.channel?.send(smallBotTest.roles.cache.map(x => x.name).join('\n'));
        // (interaction.member as GuildMember).roles.add(adminRole);
    }

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}