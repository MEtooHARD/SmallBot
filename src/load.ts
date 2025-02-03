import { help } from "./commands/slash/help";
import { inm_archive } from './commands/slash/inm_archive/main';
import { bomb } from "./commands/slash/bomb";
import { come_in } from "./commands/slash/come_in";
import { order_list } from "./commands/slash/order_list";
import { please } from "./commands/slash/please";
import { referendum } from "./commands/slash/referendum";
import { stink } from "./commands/slash/stink";
import { t0fe } from "./commands/slash/t0fe";
import { track_chess } from "./commands/slash/track_chess";
import { test } from "./commands/slash/test";


import path from 'node:path';
import { Command } from "./classes/Command";
import { should_log_commands } from "./app";
import { getDirectories } from "./functions/general/path";
import { HelpCenter } from ".";
import { InmArchive, MaterialSchema } from "./classes/InmArchive/InmArchive";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import { ApplicationCommandType } from "discord.js";

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('[Help Center] loaded');
};


export const prepareSlashCommand = (): [string, Command<ApplicationCommandType>][] => {
    const commands: [string, Command<ApplicationCommandType>][]
        = [bomb, come_in, help, inm_archive, order_list,
            please, referendum, stink, t0fe, test, track_chess]
            .map(command => {
                const instance = new command();
                return [instance.data.name, instance];
            });

    return commands
}

export const onDiscordEvents = () => {
    getDirectories(path.join(__dirname, 'events', 'discord'), true)
        .forEach(dir => { require(dir)(); });
}

export const onMongoDBEvents = () => {
    getDirectories(path.join(__dirname, 'events', 'mongoose'), true)
        .forEach(dir => { require(dir)(); });
}

export const onInmMaterialInsert = () => {
    InmArchive.Material.InsertRealtimeChannel
        .on<MaterialSchema['Row']>(REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
            { event: "INSERT", schema: 'public', table: 'material' },
            InmArchive.Material.handleInsert
        )
        .subscribe();
};