import chalk from 'chalk';
import { Client } from 'discord.js';
import { session } from '../app';
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from '../commands';

const clientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log('logged in as ' + chalk.bgYellow(session));
    console.log(`${SlashCommands.size()} (/): ${[...SlashCommands.keys()].join(', ')}`);
    console.log(`${MessageMenuCommands.size()} msg menu: ${[...MessageMenuCommands.keys()].join(', ')}`);
    console.log(`${UserMenuCommands.size()} user menu: ${[...UserMenuCommands.keys()].join(', ')}`);
}

export = clientReady;