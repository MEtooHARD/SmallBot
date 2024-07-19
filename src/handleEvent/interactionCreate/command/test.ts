import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, UserSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SelectMenuOptionBuilder, StringSelectMenuOptionBuilder, GuildMember, TextChannel } from "discord.js";
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
        await interaction.reply({ ephemeral: true, content: 'gg' });
        const rp = await (interaction.channel as TextChannel).send('test');
        await delaySec(5);
        await rp.edit('@everyone');
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}