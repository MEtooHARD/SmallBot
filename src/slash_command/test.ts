import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { Command } from "../classes/Command";
import { supabase } from "../supabase";

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
        console.log(supabase);
    }
})