import { ChatInputCommandInteraction, SlashCommandBuilder, ApplicationCommandType, InteractionContextType } from "discord.js";
import { SlashCommand, CommandValidator } from "../../classes/Command";
import { guildInfoCard } from "../../functions/discord/service";
import { Result } from "../../classes/GeneralTypes";

export class test extends SlashCommand {
    activated = true;

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM);

    validator: CommandValidator<ApplicationCommandType.ChatInput> =
        (interaction: ChatInputCommandInteraction): Result<string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
        if (interaction.guild)
            interaction.reply({ embeds: [await guildInfoCard(interaction.guild)] });
    }
}
