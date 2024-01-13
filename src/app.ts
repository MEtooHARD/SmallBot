import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";

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
        console.log('on ' + event);
        client.on(event, callback);
    }
};

const login = async (token: string) => {
    /* console.log(await  */client.login(token)/* ); */
}

const [prefix, divider] = ['s!', '!'];

enum CommandStatus {
    dev = 'dev',
    main = 'main'
}

const status = CommandStatus['main'];

export {
    on,
    login,
    prefix,
    divider,
    status,
    CommandStatus
};