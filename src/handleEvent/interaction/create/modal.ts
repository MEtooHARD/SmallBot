import { ModalSubmitInteraction } from 'discord.js';
import Log from '../../../classes/Log';
import { getSvcDir, getSvcInfo } from '../../../functions/discord/service';
import path from 'node:path';
import chalk from 'chalk';

const modal = (interaction: ModalSubmitInteraction) => {
    // console.log('modal');
    const log = new Log({ event: 'modal', user: interaction.user });
    const svcInfo = getSvcInfo(interaction.customId);

    // console.log(path.join(__dirname, '..', '..', '..', 'features'));
    if(!interaction.customId.startsWith('$')) 
        if (svcInfo?.length) {
            const dir = getSvcDir(path.join(__dirname, '..', '..', '..', 'features'), svcInfo[0]);
            // console.log(dir);
            if (dir.length) require(dir)(interaction, svcInfo, log);
            console.log(chalk.yellow('call ') + svcInfo[0]);
        }
    else {
        
    }   
}

export = modal;