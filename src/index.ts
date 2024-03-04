import { deployCommand } from "./functions/config/doDeployment";
import { login, session, shouldDeployCommand } from "./app";
import { getDirectories } from "./functions/general/path";
import config from './config.json';
import { join } from 'node:path';

(async () => {
    if (shouldDeployCommand) await deployCommand();

    getDirectories(join(__dirname, 'events'), true)
        .forEach(dir => { require(dir)() });

    await login(config.bot[session].token);
})();
