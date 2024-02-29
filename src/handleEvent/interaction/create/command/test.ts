import { ChatInputCommandInteraction, CommandInteraction, ComponentType, Message, SlashCommandBuilder } from "discord.js";
import { CommandFilterOptionType, Command } from "../../../../classes/Command";
import T0FE from "../../../../classes/T0FE";

export = new class explode implements Command<ChatInputCommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('test')
        .setDescription('test')
        .setDefaultMemberPermissions(0)
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // const t0fe = new T0FE(interaction.user, 5, 5);
        // t0fe.setBoardMessage(await interaction.reply({
        //     components: t0fe.boardDisplay,
        //     fetchReply: true
        // }));
        // t0fe.setControllerMessage(await (t0fe.boardMessage as Message).reply({ content: t0fe.progress, components: t0fe.controller }));

        // const collector = (t0fe.controllerMessage as Message)
        //     .createMessageComponentCollector({
        //         filter: interaction => interaction.user.id === t0fe.player.id,
        //         idle: T0FE.idleTime,
        //         componentType: ComponentType.Button
        //     });

        // collector.on('collect', i => {
        //     t0fe.resolveAction(i);
        // });

    }

    filter(interaction: CommandFilterOptionType): boolean {
        return true;
    }
}