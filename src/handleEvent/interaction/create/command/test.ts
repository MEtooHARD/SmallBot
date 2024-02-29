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
        const tzfe = new T0FE(interaction.user);
        tzfe.randPutNumber();
        tzfe.setBoardMessage(await interaction.reply({
            components: tzfe.boardDisplay,
            fetchReply: true
        }));
        tzfe.setControllerMessage(await (tzfe.boardMessage as Message).reply({ content: tzfe.score, components: tzfe.controller }));

        const collector = (tzfe.controllerMessage as Message)
            .createMessageComponentCollector({
                filter: interaction => interaction.user.id === tzfe.player.id,
                idle: T0FE.idleTime,
                componentType: ComponentType.Button
            });

        collector.on('collect', i => {
            tzfe.resolveAction(i.customId);
            (tzfe.boardMessage as Message).edit({ components: tzfe.boardDisplay });
            i.update({ content: tzfe.score })
        });

    }

    filter(interaction: CommandFilterOptionType): boolean {
        return true;
    }
}