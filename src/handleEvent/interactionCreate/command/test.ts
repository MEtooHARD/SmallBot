import { ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/Command";
import { Dialog, Question } from "../../../classes/Dialog";
import { delaySec } from "../../../functions/general/delay";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDMPermission(false);

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const q: Question = {
            ephemeral: true,
            header: {
                title: 'test',
                description: 'lslaldals'
            },
            options: [
                {
                    customId: 'test',
                    style: ButtonStyle.Primary,
                    label: 'teststs'
                },
                {
                    customId: 'testt',
                    style: ButtonStyle.Success,
                    label: 'testestes'
                }
            ]
        };

        await interaction.deferReply();
        await delaySec(1);
        console.log(interaction.deferred);
        interaction.followUp('rp');

        const f = async () => {
            try {
                const g = await new Dialog({
                    interaction: interaction,
                    idle: 6 * 1000
                }).awaitResponse(q);

                interaction.channel?.send('got ' + g.customId);
            } catch (e) {
                await f();
            }
        };

        // await f();

        // await interaction.reply('rp');
        // await delaySec(3);
        // await interaction.followUp({ content: 'fu', ephemeral: true });
        // await delaySec(3);
        // await interaction.followUp('fu2');
    };

    filter(interaction: ChatInputCommandInteraction): true | string {
        return true;
    }
}