import { ChatInputCommandInteraction } from "discord.js";
import { InmArchive } from "../../classes/InmArchive/InmArchive";

export async function handleRegister(interaction: ChatInputCommandInteraction) {
    /// deferred;
    let message = '';
    if (await InmArchive.hasUser(interaction.user.id)) {
        message = 'You\'re already a user of Inm Archive.';
    } else {
        if (await InmArchive.addUser(interaction.user.id))
            message = 'Registeration succeed!';
        else
            message = 'Registeration Failed.';
    }
    interaction.editReply(message);
}