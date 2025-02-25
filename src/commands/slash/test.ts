import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, ComponentType, ButtonStyle } from "discord.js";
import { ChatInputValidator, SlashCommand } from "../../classes/Command";
import { Result } from "../../classes/GeneralTypes";
import { Question } from "../../classes/ResponseCollector";
import { delaySec } from "../../functions/general/delay";

export class test extends SlashCommand {
    activated = true;

    guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM
        );

    validator: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result<string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
    }
}
