import rootPath from "get-root-path";
import { botConfig, login, mongoDB, mongodbConfig, should_deploy_command } from "./app";
import { Docor } from "./classes/Docor";
import { unknownError } from "./events/other/unknowError";
import { loadHelpCenter, onDiscordEvents, onInmMaterialInsert, onMongoDBEvents } from "./load";
import { connectMongoDB } from "./mongoose";
import path from 'node:path';
import { supabase } from "./supabase";
import { SlashCommands } from "./commands";

/* Utility */
export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');
// export const InmArc = new InmArchive(supabase);
/* Utility */

(async () => {
    /* setup */
    // supabase;
    SlashCommands;
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
