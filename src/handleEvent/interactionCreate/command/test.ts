import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, UserSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SelectMenuOptionBuilder, StringSelectMenuOptionBuilder, GuildMember } from "discord.js";
import { Command } from "../../../classes/Command";
import { delaySec } from "../../../functions/general/delay";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { MessageDialog } from "../../../classes/MessageDialog";
import { addElements, removeElements } from "../../../functions/general/array";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        interaction.reply({
            embeds: [
                {
                    footer: { text: '**test**' }
                }
            ]
        });
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}