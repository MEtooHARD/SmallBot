import { ModalSubmitInteraction } from 'discord.js';
import { getSvcDir, getSvcInfo } from '../../../functions/discord/service';
import path from 'node:path';
import chalk from 'chalk';

const modal = (interaction: ModalSubmitInteraction) => {
    const svcInfo = getSvcInfo(interaction.customId);

    if (!interaction.customId.startsWith('$'))
        if (svcInfo?.length) {
            const dir = getSvcDir(path.join(__dirname, '..', '..', '..', 'features'), svcInfo[0]);
            if (dir.length) require(dir)(interaction, svcInfo);
            console.log(chalk.yellow('call ') + svcInfo[0]);
        } else {

        }
}

export = modal;