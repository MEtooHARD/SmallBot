import { botConfig, login, mongoDB, mongodbConfig } from "./app";
import { connectMongoDB } from "./mongoose";
import setup from "./setup";
import { supabase } from "./supabase";

(async () => {
    /* discord js */
    setup();

    /* mongodb */
    if (mongoDB)
        await connectMongoDB(
            mongodbConfig.username,
            mongodbConfig.password,
            mongodbConfig.serial
        );

    /* supabase */
    // supabase;

    await login(botConfig.token);
})();
