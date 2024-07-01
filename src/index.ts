import { deployCommand } from "./functions/config/doDeployment";
import { login, session, shouldDeployCommand } from "./app";
import { getDirectories } from "./functions/general/path";
import config from './config.json';
import { join } from 'node:path';
import { connectMongoDB } from "./mongoose";

(async () => {
    /* discord js */
    if (shouldDeployCommand) await deployCommand();

    getDirectories(join(__dirname, 'events'), true)
        .forEach(dir => { require(dir)(); });

    await login(config.bot[session].token);

    /* mongodb */
    getDirectories(join(__dirname, 'events', 'mongoose'), true)
        .forEach(dir => {
            // console.log(dir);
            require(dir)();
        });

    await connectMongoDB(config.mongodb[session].username, config.mongodb[session].password);
})();
