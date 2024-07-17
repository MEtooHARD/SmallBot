import { ModalSubmitInteraction } from 'discord.js';
import { getSvcDir, getSvcInfo } from '../../functions/discord/service';
import path from 'node:path';
import fs from 'node:fs';
import rootPath from 'get-root-path';

const modal = (interaction: ModalSubmitInteraction): void => {
    // if (!interaction.customId.startsWith('$')) {
    const svcInfo = getSvcInfo(interaction.customId);

    if (svcInfo.length) {
        // const dir = getSvcDir(path.join(rootPath, 'dist', 'features'), svcInfo[0]);
        // const action = fs.readdirSync(path.join(rootPath, 'src', ''));
        // if (dir.length) require(dir)(interaction, svcInfo);
        // console.log(dir);
        // console.log(interaction.customId);
        // console.log(chalk.yellow('call ') + svcInfo[0]);
        const p = path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]);
        if (fs.existsSync(p + '.js')) require(p)(interaction, svcInfo);
    }
    // }
}

export = modal;