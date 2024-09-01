import rootPath from "get-root-path";
import path from 'node:path';
import fs from 'node:fs';
import { Command } from "./classes/Command";
import { should_log_commands } from "./app";
import { getDirectories } from "./functions/general/path";
import { CM, HelpCenter } from ".";
import { InmArchive, MaterialSchema } from "./classes/InmArchive/InmArchive";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import { ApplicationCommandType } from "discord.js";

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('[Help Center] loaded');
};

export const prepareSlashCommand = (): [string, Command<ApplicationCommandType>][] => {
    const dir = path.join(rootPath, 'dist', 'slash_command');
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(o => o.isFile() && o.name.endsWith('.js'))
        .map(f => require(path.join(dir, f.name)) as Command<ApplicationCommandType>)
        .filter(o => o instanceof Command)
        .map(c => [c.data.name, c]);
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