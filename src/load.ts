import path from 'node:path';
import { should_log_commands } from "./app";
import { getDirectories } from "./functions/general/path";
import { HelpCenter } from ".";
import { InmArchive, MaterialSchema } from "./classes/InmArchive/InmArchive";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('[Help Center] loaded');
};

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