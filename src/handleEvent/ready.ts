import chalk from 'chalk';
import { Client } from 'discord.js';
import { Services, session } from '../app';
import { MessageMenuCommands, SlashCommands, UserMenuCommands } from '../utilities';
import { MediaStorage } from '../classes/ImageStorage';
import { Grok } from '../classes/Grok';

const listCommand = (list: IterableIterator<string>) => {
    return [...list].map(name => chalk.blue(name)).join(', ');
}

const clientReady = async (client: Client): Promise<void> => {
    console.log('[djs client] ' + chalk.green('ready'));
    console.log('logged in as ' + chalk.bgYellow(session));
    console.log(`${SlashCommands.size()} slsh cmd:`, `${listCommand(SlashCommands.keys())}`);
    console.log(`${MessageMenuCommands.size()} msg menu:`, `${listCommand(MessageMenuCommands.keys())}`);
    console.log(`${UserMenuCommands.size()} usr menu:`, `${listCommand(UserMenuCommands.keys())}`);

    if (Services.ImageStorage) MediaStorage.init();
    if (Services.Grok) Grok.init();
}

export = clientReady;