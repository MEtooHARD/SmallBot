import { deployCommand } from "./functions/config/doDeployment";
import { login, mongoDB, session, shouldDeployCommand } from "./app";
import { getDirectories } from "./functions/general/path";
import config from './config.json';
import { join } from 'node:path';
import { connectMongoDB } from "./mongoose";
import { HelpCenter } from "./HelpCenter";
import unknownError from "./events/other/unknowError";

(async () => {
    /* Help center */
    HelpCenter;
    console.log('Help Center established')
    /* discord js */
    if (shouldDeployCommand) await deployCommand();

    unknownError();

    getDirectories(join(__dirname, 'events', 'discord'), true)
        .forEach(dir => { require(dir)(); });

    await login(config.bot[session].token);

    /* mongodb */
    if (mongoDB) {
        getDirectories(join(__dirname, 'events', 'mongoose'), true)
            .forEach(dir => {
                // console.log(dir);
                require(dir)();
            });

        await connectMongoDB(config.mongodb[session].username, config.mongodb[session].password, config.mongodb[session].serial);
    }
})();
