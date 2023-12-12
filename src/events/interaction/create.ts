import create from "../../handleEvent/interaction/create";
import { on } from "../../app";
import { Interaction, Events } from "discord.js";

const interactionCreate = () => on(Events.InteractionCreate, async (interaction: Interaction) => {
    await create(interaction);
})


export = interactionCreate;