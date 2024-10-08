import rootPath from "get-root-path";
import { botConfig, login, mongoDB, mongodbConfig, should_deploy_command } from "./app";
import { CommandManager } from "./classes/Command";
import { Docor } from "./classes/Docor";
import { unknownError } from "./events/other/unknowError";
import { loadHelpCenter, prepareSlashCommand, onDiscordEvents, onInmMaterialInsert, onMongoDBEvents } from "./load";
import { connectMongoDB } from "./mongoose";
import { supabase } from "./supabase";
import path from 'node:path';

/* Utility */
export const CM = new CommandManager(prepareSlashCommand());
export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');
// export const InmArc = new InmArchive(supabase);
/* Utility */

(async () => {
    /* setup */
    supabase;
    unknownError();
    loadHelpCenter();
    onDiscordEvents();
    onInmMaterialInsert();
    if (should_deploy_command) {
        const [success, error] = await CM.registerCommands();
        if (success) console.log(`(/): ${[...CM.keys()].join(', ')}`);
        else console.log(error)
    }

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
