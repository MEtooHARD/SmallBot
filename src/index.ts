import { login, mongoDB, session } from "./app";
import { getDirectories } from "./functions/general/path";
import config from './config.json';
import { join } from 'node:path';
import { connectMongoDB } from "./mongoose";
import setup from "./setup";

(async () => {
  /* discord js */
  setup();

  getDirectories(join(__dirname, 'events', 'discord'), true)
    .forEach(dir => { require(dir)(); });

  await login(config.bot[session].token);

  /* mongodb */
  if (mongoDB) {
    getDirectories(join(__dirname, 'events', 'mongoose'), true)
      .forEach(dir => { require(dir)(); });

    await connectMongoDB(config.mongodb[session].username, config.mongodb[session].password, config.mongodb[session].serial);
  }
})();
