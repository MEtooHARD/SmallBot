import { Interaction } from "discord.js";
import Log from "../classes/Log";
import { getSvcDir } from '../functions/discord/service';
import path from 'node:path';

const orderlist = (interaction: Interaction, svcInfo: string[], log: Log) => {
    const dir = getSvcDir(path.join(__dirname, 'OrderList'), svcInfo[1]);
    
    if (dir.length)
        require(dir)(interaction, svcInfo, log);
    else
        console.log('failed load order list modal');
}

export = orderlist;