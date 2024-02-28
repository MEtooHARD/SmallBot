import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { login, session, shouldDeployCommand } from "./app";
import config from './config.json';
import { deployCommand } from "./functions/config/doDeployment";
import { getDirectories } from "./functions/general/path";
import { join } from 'node:path';

(async () => {
    if (shouldDeployCommand) await deployCommand();

    getDirectories(join(__dirname, 'events'), true)
        .forEach(dir => { require(dir)() });

    await login(config.bot[session].token);
})();


interface C<T extends string | number> {
    exe: (I: T) => void
}

class BRUH implements C<string> {
    exe = (I: string) => { }
}

class LMAO implements C<number> {
    exe = (I: number) => { }
}

