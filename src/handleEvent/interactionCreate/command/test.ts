import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import ButtonRow from "../../../classes/ActionRow/ButtonRow";
import { Button } from "../../../classes/ActionRow/Button";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // const reply = await interaction.reply({
        //     content: '0',
        //     components: [
        //         new ButtonRow([
        //             new Button({
        //                 customId: 'test',
        //                 style: ButtonStyle.Primary,
        //                 label: 'test'
        //             })
        //         ])
        //     ]
        // })

        // const collector = reply.createMessageComponentCollector({ time: 120 * 1000 });

        // collector.on('collect', (interaction: ButtonInteraction) => {
        //     interaction.update({
        //         content: String(Number(interaction.message.content) + 1)
        //     })
        // })
        interaction.reply({
            embeds: [
                {
                    title: 'test',
                    fields: []
                }
            ]
        })
    }

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}