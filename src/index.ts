import { login } from "./app";
import config from './config.json';
import { getDirectories } from "./functions/path/path";

import { join } from 'node:path';
getDirectories(join(__dirname, 'events'), true).forEach(dir => {
    console.log(dir);
    require(dir)()
});

login(config.bot.main.token);
