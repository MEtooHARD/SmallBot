import rootPath from "get-root-path";
import { botConfig, login, mongoDB, mongodbConfig, should_deploy_command } from "./app";
import { CommandManager } from "./classes/Command";
import { Docor } from "./classes/Docor";
import { unknownError } from "./events/other/unknowError";
import { loadHelpCenter, loadSlashCommand, onDiscordEvents, onMongoDBEvents } from "./load";
import { connectMongoDB } from "./mongoose";
import { supabase } from "./supabase";
import path from 'node:path';
import { InmArchiveManager } from "./classes/InmArchive/InmArchive";

/* Utility */
export const CM = new CommandManager();
export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');
export const InmArchive = new InmArchiveManager(supabase);
/* Utility */

(async () => {
    /* setup */
    unknownError();
    loadHelpCenter();
    loadSlashCommand();
    onDiscordEvents();
    onMongoDBEvents();
    supabase;
    if (should_deploy_command) await CM.registerAllCommands();

    /* mongodb */
    if (mongoDB)
        await connectMongoDB(
            mongodbConfig.username,
            mongodbConfig.password,
            mongodbConfig.serial
        );

    /* supabase */
    // InmArchive;

    await login(botConfig.token);
})();
