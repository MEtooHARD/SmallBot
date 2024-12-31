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

import bomb from './slash_command/general/bomb';
import come_in from "./slash_command/general/come_in";
import help from "./slash_command/general/help";
import inm_arch from './slash_command/general/inm_archive/_command_';
import order_list from "./slash_command/general/order_list";
import please from "./slash_command/general/please";
import referendum from "./slash_command/general/referendum";
import stink from "./slash_command/general/stink";
import t0fe from "./slash_command/general/t0fe";
import test from "./slash_command/general/test";
import track_chess from "./slash_command/general/track_chess";

export const prepareSlashCommand = (): [string, Command<ApplicationCommandType>][] => {
    // const dir = path.join(rootPath, 'dist', 'slash_command');
    const commands: [string, Command<ApplicationCommandType>][] = [
        bomb,
        come_in,
        help,
        inm_arch,
        order_list,
        please,
        referendum,
        stink,
        t0fe,
        test,
        track_chess
    ]
        .map(command => [command.data.name, command]);

    /* fs.readdirSync(dir, { withFileTypes: true })
        .filter(o => o.isFile() && o.name.endsWith('.js'))
        .map(f => require(path.join(dir, f.name)) as Command<ApplicationCommandType>)
        .filter(o => o instanceof Command)
        .map(c => [c.data.name, c]); */
    // commands.push([inm_arch.data.name, inm_arch]);
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