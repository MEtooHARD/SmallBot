import rootPath from "get-root-path";
import path from 'node:path';
import fs from 'node:fs';
import { Command } from "./classes/Command";
import { CM, HelpCenter, should_log_commands } from "./app";
import { getDirectories } from "./functions/general/path";

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('[Help Center] loaded');
};

export const loadSlashCommand = (refresh: boolean = false) => {
    const dir = path.join(rootPath, 'dist', 'slash_command');
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(o => o.isFile() && o.name.endsWith('.js'))
        .map(f => require(path.join(dir, f.name)))
        .filter(o => o instanceof Command)
        .forEach(c => CM.addCommand(c));

    if (should_log_commands) console.log(`Commands: ${CM.getCommandNames().join(', ')}`);
};

export const onDiscordEvents = () => {
    getDirectories(path.join(__dirname, 'events', 'discord'), true)
        .forEach(dir => { require(dir)(); });
}

export const onMongoDBEvents = () => {
    getDirectories(path.join(__dirname, 'events', 'mongoose'), true)
        .forEach(dir => { require(dir)(); });
}