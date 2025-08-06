import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/Command";
import { GrokModels } from "../../../classes/LLM/Wrapper";

const models: Array<keyof typeof GrokModels> =
    Object.keys(GrokModels) as Array<keyof typeof GrokModels>;

export class LLM extends SlashCommand {
    data = new SlashCommandBuilder()
        .setName('llm')
        .setDescription('start chatting with LLMs')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setAutocomplete(true)
            .setRequired(false)
            .setName('model')
            .setDescription('the model to use')
        )
        .addNumberOption(option => option
            .setRequired(false)
            .setName('temperature')
            .setDescription('sets the temperature of the model, default 1.3')
            .setMaxValue(2)
            .setMinValue(0.1)
        )
        .addStringOption(option => option
            .setRequired(false)
            .setName('prompt')
            .setDescription('sets a system prompt that will be inserted at the top')
            .setMaxLength(1000)
        )

    async complete(interaction: AutocompleteInteraction): Promise<void> {
        switch (interaction.options.getFocused()) {
            case 'model':
                interaction.respond(models.map(model => ({
                    name: model,
                    value: model
                })));
                return;
        }
    }

    async executor(interaction: ChatInputCommandInteraction<CacheType>) {

    }
}