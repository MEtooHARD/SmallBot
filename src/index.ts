import { login, mongoDB, session } from "./app";
import config from './config.json';
import { connectMongoDB } from "./mongoose";
import setup from "./setup";

(async () => {
    /* discord js */
    setup();

    /* mongodb */
    if (mongoDB)
        await connectMongoDB(
            config.mongodb[session].username,
            config.mongodb[session].password,
            config.mongodb[session].serial
        );

    await login(config.bot[session].token);
})();
