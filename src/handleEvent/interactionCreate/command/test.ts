import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, UserSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, SelectMenuOptionBuilder, StringSelectMenuOptionBuilder, GuildMember, TextChannel, ApplicationCommandType } from "discord.js";
import { delaySec } from "../../../functions/general/delay";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { MessageDialog } from "../../../classes/MessageDialog";
import { addElements, removeElements } from "../../../functions/general/array";
import { a_b_percent } from "../../../functions/general/number";
import { Command } from "../../../classes/Command";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        throw new Error('test');
    }
})