import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, UserSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SelectMenuOptionBuilder, StringSelectMenuOptionBuilder, GuildMember, TextChannel } from "discord.js";
import { Command } from "../../../classes/_Command";
import { delaySec } from "../../../functions/general/delay";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { MessageDialog } from "../../../classes/MessageDialog";
import { addElements, removeElements } from "../../../functions/general/array";
import { a_b_percent } from "../../../functions/general/number";
import { SlashCommand } from "../../../classes/Command";

export = new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false)
    ,
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        throw new Error('test');
    }
})