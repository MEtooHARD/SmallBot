import { ChatInputCommandInteraction } from "discord.js";
import { InmArc } from "../..";

export async function handleRegister(interaction: ChatInputCommandInteraction) {
    /// deferred;
    let message = '';
    if (await InmArc.existsUser(interaction.user.id)) {
        message = 'You\'re already a user of Inm Archive.';
    } else {
        if (await InmArc.addUser(interaction.user.id))
            message = 'Registeration succeed!';
        else
            message = 'Registeration Failed.';
    }
    interaction.editReply(message);
}