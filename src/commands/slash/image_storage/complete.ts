import { AutocompleteInteraction } from "discord.js";
import { AutoComplete } from "../../../classes/Command";
import { MediaStorage } from "../../../classes/ImageStorage";
import { strNotEmpty } from "./command";

export const complete: AutoComplete = async (interaction) => {
    const guildId = interaction.guildId as string;

    const subC = interaction.options.getSubcommand();
    const subG = interaction.options.getSubcommandGroup();

    const focused = interaction.options.getFocused(true);
    const group = interaction.options.getString('group')?.trim();
    const name = interaction.options.getString('name')?.trim();

    if (subG === 'rename') {
        const newGroup = interaction.options.getString('new_group')?.trim();
        const newName = interaction.options.getString('new_name')?.trim();

        if (focused.name === 'group' || focused.name === 'new_group')
            returnGroups(interaction);
        else if (focused.name === 'name' && group)
            returnNamesOfGroup(interaction, group, name || '');
        else if (focused.name === 'new_name' && (newGroup || group))
            returnNamesOfGroup(interaction, (newGroup || group)!, newName || '');
    } else {
        if (subC === 'add' || subC === 'remove' || subC === 'get') {
            if (focused.name === 'group') returnGroups(interaction);
            else if (focused.name === 'name')
                if (group) returnNamesOfGroup(interaction, group, name || '');
        }
    }
};

const returnGroups: AutoComplete = async (interaction) => {
    const { data, error } = await MediaStorage.searchGroups(interaction.guildId as string);

    if (data) {
        interaction.respond(data
            .filter(v => strNotEmpty(v.group))
            .slice(0, 25)
            .map(g => ({ name: g.group, value: g.group }))
        );
    } else if (error)
        console.error(error);
}

const returnNamesOfGroup = async (interaction: AutocompleteInteraction, group: string, name: string) => {
    const { data, error } = await MediaStorage.searchNameByGroup(interaction.guildId as string, group, name);

    if (data) {
        interaction.respond(data.map(v => ({ name: v.name, value: v.name })));
    } else if (error) {
        console.error(error);
    }
}