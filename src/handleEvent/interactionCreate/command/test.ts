import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, UserSelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import { delaySec } from "../../../functions/general/delay";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { MessageDialog } from "../../../classes/MessageDialog";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const dialog = new MessageDialog({ interaction: interaction });
        const response = await dialog.awaitResponse({
            header: {
                description: 'please mention someone'
            },
            UID: interaction.user.id,
            ephemeral: false
        });

        interaction.channel?.send('mentioned member:' +
            response.mentions.members?.map(member => member.displayName));
    };






    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}