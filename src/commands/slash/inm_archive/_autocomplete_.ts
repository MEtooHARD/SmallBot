import { AutocompleteInteraction } from "discord.js";

export const autocomplete = async (interaction: AutocompleteInteraction): Promise<void> => {
    // console.log(interaction.options);
    const text_option = interaction.options.getString('text');
    const image_option = interaction.options.getString('image');


};