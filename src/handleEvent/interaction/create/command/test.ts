import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";

export = new class explode extends Command {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDefaultMemberPermissions(0)
        .setDMPermission(true)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        interaction.reply({
            ephemeral: true,
            content: 'recieved'
        })
        const UID = interaction.user.id;
        const DM = await interaction.user.createDM();
        DM.send('your UID: ' + UID);
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}