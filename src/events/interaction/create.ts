import create from "../../handleEvent/interaction/create";
import { on } from "../../app";
import { Interaction } from "discord.js";

const interactionCreate = () => on('interactionCreate', async (interaction: Interaction) => {
    await create(interaction);
})


export = interactionCreate;