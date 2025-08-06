import {
    Client,
    ClientEvents,
    IntentsBitField,
    Partials
} from "discord.js";
import { Report } from "./classes/MessageFeature";
import config from './config.json';

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
client.options.failIfNotExists = false;

export const login = async (token: string) => { client.login(token) };
export const on = (event: keyof ClientEvents, callback: (...args: any) => Promise<Report>) => {
    client.on(event, async (...args) => {
        const report = await callback(...args);
        if (!report.success && !report.handled) {
            console.log('[djs client] unhandled event ' + event);
        } else {
            if (!report.success) {
                console.log('failure on event ' + event + ': ' + report.message);
                console.log(report.error);
                console.log(report.metadata);
            }
        }
    });
    console.log('[djs client] on ' + event);
};

/* Define */
export enum Session { dev = 'dev', main = 'main' };
export const [prefix, dividor] = ['s', '!'];
export const SupervisorGuildId = '1213341621542719548';
export const BugReportingChannel = '1267489062135009290';
/* Define */

/* Start Up Settings */
export const session: Session = config.session === 0 ? Session.main : Session.dev;
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

/* Database */
export const mongoDB: boolean = false;
export const supabase: boolean = true;
/* Database */

/* Services */
export const Services = {
    ImageStorage: false && supabase,
    Grok: true
}
/* Services */
