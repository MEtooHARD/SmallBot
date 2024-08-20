import { AnySelectMenuInteraction } from 'discord.js';
import { getSvcInfo } from '../../functions/discord/service';
import rootPath from 'get-root-path';
import path from "node:path";
import fs from 'node:fs';


const menu = async (interaction: AnySelectMenuInteraction) => {
  // if (!interaction.customId.startsWith('$')) {
  const svcInfo = getSvcInfo(interaction.customId);

  // if (svcInfo.length) {
  //     const p = path.join(rootPath, 'dist', 'features', svcInfo[0], svcInfo[1]);
  //     if (fs.existsSync(p + '.js')) require(p)(interaction, svcInfo);
  // }
  // }
};

export = menu;