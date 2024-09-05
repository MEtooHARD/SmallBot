import { AutocompleteInteraction } from "discord.js";

export const autocomplete = async (interaction: AutocompleteInteraction): Promise<void> => {
    console.log(interaction.options);

}