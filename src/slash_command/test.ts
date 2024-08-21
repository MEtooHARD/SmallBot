import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { Command } from "../classes/Command";
import { range } from "../functions/general/iteral";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply(Array.from(range(5)).map(n => n.toString()).join(', '));
    }
})