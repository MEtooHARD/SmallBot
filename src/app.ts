import { Client, ClientEvents, IntentsBitField, Partials } from "discord.js";
import { CommandManager } from "./classes/Command";
import { Docor } from "./classes/Docor";
import rootPath from "get-root-path";
import path from 'node:path';

export const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildVoiceStates,
            IntentsBitField.Flags.DirectMessages,
        ],
        partials: [
            Partials.Channel
        ]
    }
);

export const login = async (token: string) => { client.login(token) };
export const on = (event: keyof ClientEvents, callback = (...args: any) => { }) => {
    client.on(event, callback);
    console.log('[djs client] on ' + event);
};

/* Define */
export enum Session { dev = 'dev', main = 'main' };
export const [prefix, dividor] = ['s', '!'];
/* Define */

/* Start Up Settings */
export const session: Session = Session.dev;
export const mongoDB: boolean = true;
export const should_log_doc = false;
export const should_log_commands = true;
export const should_deploy_command = false;
/* Start Up Settings */

/* Run Time Settings */
export const shouldLogIgnoredCustomID = false;
/* Run Time Settings */

/* Utility */
export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');
export const CM = new CommandManager();
// export const ReferendumManager = new VoteManager();
/* Utility */
