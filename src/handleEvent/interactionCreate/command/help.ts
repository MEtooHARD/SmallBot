import { CommandInteraction, ComponentType, SlashCommandBuilder, StringSelectMenuInteraction } from 'discord.js';
import { HelpCenter } from '../../../classes/HelpCenter';
import { Command } from '../../../classes/Command';


export = new class help implements Command<CommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')

    execute = async (interaction: CommandInteraction) => {
        const helpCenter = new HelpCenter();
        const replyMessage = await interaction.reply({ ...helpCenter.reply(), fetchReply: true });
        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            idle: 5 * 60 * 1000,
            filter: (i) => i.message.id === replyMessage.id
        });

        collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
            if (interaction instanceof StringSelectMenuInteraction) {
                switch (interaction.values[0]) {
                    case 'back':
                        helpCenter.back();
                        break;
                    case 'home':
                        helpCenter.home();
                        break;
                    default:
                        helpCenter.goto(interaction.values[0]);
                }
                interaction.update(helpCenter.update());
            }
        });

        collector.on('end', async () => {
            try {
                await interaction.followUp({
                    content: 'Timed out.',
                    components: [],
                    ephemeral: true
                });
            } catch (e) { }
        });
    }

    filter(interaction: CommandInteraction): true | string {
        return true;
    }
}