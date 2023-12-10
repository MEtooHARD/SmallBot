import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction, AnySelectMenuInteraction, Interaction } from 'discord.js';

const handleButton = (interaction: ButtonInteraction) => { }
const handlleComand = (interaction: CommandInteraction) => { }
const handleModalSubmit = (interaction: ModalSubmitInteraction) => { }
const handleAnySelectMenu = (interaction: AnySelectMenuInteraction) => { }

const create = async (interaction: Interaction): Promise<void> => {
    if (interaction.isButton()) handleButton(interaction);
    else if (interaction.isCommand()) handlleComand(interaction);
    else if (interaction.isModalSubmit()) handleModalSubmit(interaction);
    else if (interaction.isAnySelectMenu()) handleAnySelectMenu(interaction);
}

export = create;