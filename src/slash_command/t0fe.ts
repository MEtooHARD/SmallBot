import { ApplicationCommandType, ChatInputCommandInteraction, ComponentType, Message, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/Command";
import T0FE from "../classes/games/T0FE";

export = new Command<ApplicationCommandType.ChatInput>({
    data: new SlashCommandBuilder()
        .setName('t0fe')
        .setDescription('2048')
        .addIntegerOption(option => option
            .setRequired(false)
            .setName('row_size')
            .setDescription('The row\'s size, default 5.')
            .addChoices(...([3, 4, 5].map(x => {
                return {
                    name: x.toString(),
                    value: x
                }
            }))))
        .addIntegerOption(option => option
            .setRequired(false)
            .setName('col_size')
            .setDescription('The row\'s size, default 5.')
            .addChoices(...([3, 4, 5].map(x => {
                return {
                    name: x.toString(),
                    value: x
                }
            }))))
        .setDMPermission(false)
    ,
    async executor(interaction: ChatInputCommandInteraction): Promise<void> {
        const [rowSize, colSize] = [interaction.options.getInteger('row_size'), interaction.options.getInteger('col_size')];
        const t0fe = new T0FE(interaction.user, rowSize || 5, colSize || 5);
        t0fe.setBoardMessage(await interaction.reply({
            components: t0fe.boardDisplay,
            fetchReply: true
        }));
        t0fe.setControllerMessage(await (t0fe.boardMessage as Message).reply({ embeds: [t0fe.progress], components: t0fe.controller }));

        const collector = (t0fe.controllerMessage as Message)
            .createMessageComponentCollector({
                filter: interaction => interaction.user.id === t0fe.player.id,
                idle: T0FE.idleTime,
                componentType: ComponentType.Button
            });

        collector.on('collect', i => {
            t0fe.resolveAction(i);
        });

        collector.on('end', dummy => {
            t0fe.gameover();
        })
    }
});