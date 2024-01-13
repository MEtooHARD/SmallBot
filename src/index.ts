import { login, status } from "./app";
import config from './config.json';
import { deploy, shouldDeployCommand } from "./functions/config/doDeployment";
import { getDirectories } from "./functions/path/path";
import { join } from 'node:path';

(async () => {
    if (shouldDeployCommand(status))
        await deploy();

    getDirectories(join(__dirname, 'events'), true).forEach(dir => {
        require(dir)();
    });

    await login(config.bot.main.token);
})();