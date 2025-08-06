import { AutocompleteInteraction, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { Result_ } from "../../../classes/Basic/GeneralTypes";
import { ChatInputValidator, SlashCommand } from "../../../classes/Command";

export class test extends SlashCommand {
    activated = true;

    guilds: string[] = ['1213341621542719548', '1146136373225586828'];

    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setContexts(
            InteractionContextType.Guild,
            InteractionContextType.BotDM
        )
        .addStringOption(option => option
            .setName('model')
            .setDescription('the model to use')
            .setAutocomplete(true)
        )

    async complete(interaction: AutocompleteInteraction) {
        if (interaction.options.getFocused() === 'model') {
            interaction.respond([
                { name: 'model C', value: 'model C' },
                { name: 'model F', value: 'model F' }
            ]);
            return;
        }
        // else if ()
    }

    verify: ChatInputValidator =
        (interaction: ChatInputCommandInteraction): Result_<string, string> => {
            return [interaction.user.id === '732128546407055452',
                'You are not allowed to use this command.'];
        };

    executor = async (interaction: ChatInputCommandInteraction) => {
    }
}
