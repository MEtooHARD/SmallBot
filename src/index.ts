import rootPath from "get-root-path";
import { botConfig, login, mongoDB, mongodbConfig, should_deploy_command } from "./app";
import { Docor } from "./classes/Docor";
import { unknownError } from "./events/other/unknowError";
import { loadHelpCenter, onDiscordEvents, onInmMaterialInsert, onMongoDBEvents } from "./load";
import { connectMongoDB } from "./mongoose";
import path from 'node:path';
import { SlashCommands } from "./utilities";
import { ImageStorage } from "./classes/ImageStorage";

(async () => {
    /* setup */
    SlashCommands;
    ImageStorage.init();
    unknownError();
    loadHelpCenter();
    onDiscordEvents();
    /* setup */

    onInmMaterialInsert();
    // if (should_deploy_command) {
    //     const [success, error] = await SlashCommands.registerCommands();
    //     if (success) console.log(`${SlashCommands.amount()} (/): ${[...SlashCommands.keys()].join(', ')}`);
    //     else console.log(error);
    // }

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
