import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { Command } from "../classes/Command";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('upload an image')
        )
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        // await interaction.reply(Array.from(range(5)).map(n => n.toString()).join(', '));
        const attachment = interaction.options.getAttachment('image');
        if (attachment) {
            interaction.channel?.send(attachment.url);
        }
    }
})