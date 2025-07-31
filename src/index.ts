import { botConfig, login, mongoDB, mongodbConfig } from "./app";
import { unknownError } from "./events/other/unknowError";
import { loadHelpCenter, onDiscordEvents, onMongoDBEvents } from "./load";
import { connectMongoDB } from "./mongoose";

(async () => {
    /* setup */
    unknownError();
    loadHelpCenter();
    onDiscordEvents();
    // onSIGINT();
    // onExit();
    /* setup */

    // onInmMaterialInsert();

    /* mongodb */
    if (mongoDB) {
        onMongoDBEvents();
        await connectMongoDB(
            mongodbConfig.username,
            mongodbConfig.password,
            mongodbConfig.serial
        );
    }

    /* supabase */
    // InmArchive;

    await login(botConfig.token);
})();
