import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType, InteractionContextType } from "discord.js";
import { Command } from "../../classes/Command";
import { guildInfoCard } from "../../functions/discord/service";

export class test extends Command<ApplicationCommandType.ChatInput> {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM);

    executor = async (interaction: ChatInputCommandInteraction) => {
        if (interaction.guild)
            interaction.reply({ embeds: [await guildInfoCard(interaction.guild)] });
    }
}
