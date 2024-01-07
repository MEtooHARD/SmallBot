import { BaseInteraction, ButtonInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../../../../classes/Command";
import SuperMarket from "../../../../classes/SuperMarket";

export = new class explode extends Command {
    data = new SlashCommandBuilder()
        .setName('supermarket')
        .setDescription('supermarket someone.')
        .addUserOption(option => option
            .setName('object')
            .setDescription('the poor.')
            .setRequired(true))
        .setDMPermission(false)

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const loli = interaction.options.getUser('object');

        if (loli) {
            const supermarket = new SuperMarket(interaction.user, loli);

            const infoPage = supermarket.infoPage();

            infoPage.setMessage((await interaction.reply({
                fetchReply: true,
                ephemeral: infoPage.ephemeral,
                content: infoPage.content,
                embeds: infoPage.embeds,
                components: infoPage.components,
            })))
                .setProcess(() => {
                    if (infoPage.message) {
                        const collector = infoPage.message.createMessageComponentCollector();

                        collector.on('collect', (interaction: BaseInteraction) => {
                            if (interaction instanceof ButtonInteraction) {
                                switch (interaction.customId) {
                                    case '$marketergender':
                                        supermarket.marketer.switchGender();
                                        interaction.update(supermarket.infoPage());
                                        break;
                                    case '$objectgender':
                                        supermarket.object.switchGender();
                                        interaction.update(supermarket.infoPage());
                                        break;
                                    case '$startsupermarket':
                                        collector.emit('end');
                                        try {
                                            interaction.update({
                                                content: 'Nice one lmao.',
                                                embeds: [],
                                                components: []
                                            });
                                        } catch (e) { }
                                        interaction.channel?.send({
                                            content: ''
                                        });
                                        break;
                                }
                            }
                        });
                    }
                }).start();

        }

    }

    filter(interaction: ChatInputCommandInteraction): boolean {
        return true;
    }
}