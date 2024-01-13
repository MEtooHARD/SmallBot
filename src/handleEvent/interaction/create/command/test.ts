import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";

export = new class explode extends Command {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.guild)
            console.log(interaction.guild.systemChannel);
    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}