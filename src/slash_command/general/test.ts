import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { Command } from "../../classes/Command";
import { guildInfoCard } from "../../functions/discord/service";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('upload an image')
        )
    // .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.guild)
            interaction.reply({ embeds: [await guildInfoCard(interaction.guild)] });
    }
})