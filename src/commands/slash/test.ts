import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType, InteractionContextType } from "discord.js";
import { AppCommand, CommandValidator } from "../../classes/Command";
import { guildInfoCard } from "../../functions/discord/service";
import { Result } from "../../classes/GeneralTypes";

export class test extends AppCommand<ApplicationCommandType.ChatInput> {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM);

    validator: CommandValidator<ApplicationCommandType.ChatInput> =
        (interaction: ChatInputCommandInteraction): Result<string> => {
            return [true];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
        if (interaction.guild)
            interaction.reply({ embeds: [await guildInfoCard(interaction.guild)] });
    }
}
