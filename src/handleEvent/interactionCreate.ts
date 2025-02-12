import { BaseInteraction, MessageComponentInteraction } from 'discord.js';
import menu from './interactionCreate/menu';
import modal from './interactionCreate/modal';
import button from './interactionCreate/button';
import autocomplete from './interactionCreate/autocomplete';
import { getSvcInfo } from '../functions/discord/service';
import { shouldLogIgnoredCustomID } from '../app';
import { Manager } from '../classes/Basic/Manager';
import { InmArchive } from '../features/InmArchive'
import { OrderList } from '../features/OrderList'
import { Referendum } from '../features/Referendum'
import { handleMessageContextMenuCommand } from './interactionCreate/MessagContextMenu';
import { handleUserContextMenuCommand } from './interactionCreate/UserContextMenu';
import { handleSlashCommand } from './interactionCreate/SlashCommand';

type FeatureHandler = (interaction: MessageComponentInteraction, svcInfo: string[]) => Promise<void>;
const FeatureManager = new Manager<FeatureHandler>([
    ['InmArchive', InmArchive],
    ['OrderList', OrderList],
    ['Referendum', Referendum],
]);

const create = async (interaction: BaseInteraction): Promise<void> => {
    if (interaction.isChatInputCommand())
        handleSlashCommand(interaction);
    else if (interaction.isMessageContextMenuCommand())
        handleMessageContextMenuCommand(interaction);
    else if (interaction.isUserContextMenuCommand())
        handleUserContextMenuCommand(interaction);
    else if (interaction.isAutocomplete())
        autocomplete(interaction);
    else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith('$')) {
            console.log(interaction.customId);
            const svcInfo = getSvcInfo(interaction.customId);
            if (svcInfo.length) {
                const feature = FeatureManager.get(svcInfo[0]);
                if (feature)
                    feature(interaction as MessageComponentInteraction, svcInfo)
                else {
                    console.log('service failed: ' + interaction.customId);
                    await interaction.reply({ flags: 'Ephemeral', content: 'service not found' });
                }
            } else {
                if (interaction.isButton()) await button(interaction);
                else if (interaction.isModalSubmit()) await modal(interaction);
                else if (interaction.isAnySelectMenu()) await menu(interaction);
            }
        } else {
            if (shouldLogIgnoredCustomID) console.log(interaction.customId);
        }
    }
};

export = create;