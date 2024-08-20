import { ModalSubmitInteraction } from 'discord.js';
import { getSvcDir, getSvcInfo } from '../../functions/discord/service';
import path from 'node:path';
import fs from 'node:fs';
import rootPath from 'get-root-path';

const modal = async (interaction: ModalSubmitInteraction): Promise<void> => {
  const svcInfo = getSvcInfo(interaction.customId);

  // if (svcInfo.length) {
  //     const p = path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]);
  //     if (fs.existsSync(p + '.js')) require(p)(interaction, svcInfo);
  // }
}

export = modal;