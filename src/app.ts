import { Client, ClientEvents, IntentsBitField } from "discord.js";
import { VoteManager } from "./classes/Vote";

export const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildVoiceStates
        ]
    }
);

export const on = (event: keyof ClientEvents, callback = (...inputs: any) => { }) => {
    client.on(event, callback);
    console.log('[djs client] on ' + event);
};

export const login = async (token: string) => { client.login(token) };

export const [prefix, dividor] = ['s', '!'];

export const shouldLogDoc = false;
export const shouldDeployCommand = true;
export const shouldLogIgnoredCustomID = false;

export enum Session {
    dev = 'dev',
    main = 'main'
}

export const session: Session = Session.dev;

export const mongoDB: boolean = false;

export const ReferendumManager = new VoteManager();