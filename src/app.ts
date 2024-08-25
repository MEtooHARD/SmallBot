import { Client, ClientEvents, IntentsBitField, Partials } from "discord.js";
import { CommandManager } from "./classes/Command";
import { Docor } from "./classes/Docor";
import config from './config.json';
import rootPath from "get-root-path";
import path from 'node:path';
import { InmArchiveManager } from "./classes/InmArchive/InmArchive";
import { supabase } from "./supabase";

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
export const mongoDB: boolean = false;
export const should_log_doc = false;
export const should_log_commands = true;
export const should_deploy_command = false;
/* Start Up Settings */

/* Config */
export const botConfig = config.bot[session];
export const mongodbConfig = config.mongodb[session];
export const supabaseConfig = config.supabase[session];
/* Config */

/* Run Time Settings */
export const shouldLogIgnoredCustomID = false;
/* Run Time Settings */


