import { Interaction } from "discord.js";
import { getSvcDir } from '../functions/discord/service';
import path from 'node:path';

const orderlist = (interaction: Interaction, svcInfo: string[]) => {
    const dir = getSvcDir(path.join(__dirname, 'OrderList'), svcInfo[1]);

    if (dir.length)
        require(dir)(interaction, svcInfo);
    else
        console.log('failed load order list modal');
}

export = orderlist;