import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../../classes/Command';
import { HelpCenter } from '../../../HelpCenter';
import { Docor } from '../../../classes/Docor';


export = new class help implements Command<CommandInteraction> {
    data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get some help from here.')

    execute = async (interaction: CommandInteraction) => {
        const doc = HelpCenter.getDoc(['Help Center']);
        interaction.reply({
            ephemeral: true,
            embeds: doc ? doc.getEmbeds() : [],
            components: doc ? [Docor.resolveToSelectMenu(doc)] : [],
            content: doc ? '' : 'something went wrong.'
        });
        // const helpCenter = new HelpCenter();
        // const replyMessage = await interaction.reply({ ...helpCenter.reply(), fetchReply: true });
        // const collector = replyMessage.createMessageComponentCollector({
        //     componentType: ComponentType.StringSelect,
        //     idle: 5 * 60 * 1000,
        //     filter: (i) => i.message.id === replyMessage.id
        // });

        // collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
        //     if (interaction instanceof StringSelectMenuInteraction) {
        //         switch (interaction.values[0]) {
        //             case 'back':
        //                 helpCenter.back();
        //                 break;
        //             case 'home':
        //                 helpCenter.home();
        //                 break;
        //             default:
        //                 helpCenter.goto(interaction.values[0]);
        //         }
        //         interaction.update(helpCenter.update());
        //     }
        // });

        // collector.on('end', async () => {
        //     try {
        //         await interaction.followUp({
        //             content: 'Timed out.',
        //             components: [],
        //             ephemeral: true
        //         });
        //     } catch (e) { }
        // });
    }

    filter(interaction: CommandInteraction): true | string {
        return true;
    }
}