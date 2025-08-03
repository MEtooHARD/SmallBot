import { AnySelectMenuInteraction, ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import fs from 'node:fs';
import path from 'node:path';
import { getSvcInfo } from "../../functions/discord/service";


export async function handleButton(
    interaction: ButtonInteraction
) {
    for (const name of fs.readdirSync(path.join(__dirname, 'button'))
        .filter(file => file.endsWith('.js')))
        if (name === interaction.customId.concat('.js'))
            await require('./button/' + interaction.customId)(interaction);

}


export async function handleSelectMenu(
    interaction: AnySelectMenuInteraction
) {
    // if (!interaction.customId.startsWith('$')) {
    const svcInfo = getSvcInfo(interaction.customId);

    // if (svcInfo.length) {
    //     const p = path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]);
    //     if (fs.existsSync(p + '.js')) require(p)(interaction, svcInfo);
    // }
    // }
};


export async function handleModal(
    interaction: ModalSubmitInteraction
): Promise<void> {
    const svcInfo = getSvcInfo(interaction.customId);

    // if (svcInfo.length) {
    //     const p = path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]);
    //     if (fs.existsSync(p + '.js')) require(p)(interaction, svcInfo);
    // }
}