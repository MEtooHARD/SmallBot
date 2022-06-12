const { Client, Intents } = require('discord.js');
const token = require('./token.json')
const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    //Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
] });

const login = () => {
  client.login(token["token"]);
}


module.exports = {
  login: login,
  client: client,
}