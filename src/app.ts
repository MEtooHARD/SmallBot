import { Client, IntentsBitField } from "discord.js";
import Central from "./classes/Central";
import { CommandDeployStatus } from "./config/status";

const client = new Client(
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

const on = (event = '', callback = (...inputs: any) => { }) => {
    if (event) {
        client.on(event, callback);
        console.log('client on ' + event);
    }
};

const login = async (token: string) => {
    client.login(token)
}

const [prefix, divider] = ['s!', '!'];

const status = CommandDeployStatus['main'];

const central = new Central();

export {
    on,
    login,
    prefix,
    divider,
    status,
    central
};