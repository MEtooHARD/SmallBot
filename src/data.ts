import rootPath from "get-root-path";
import { Docor } from "./classes/Docor";
import path from 'node:path';
import fs from 'node:fs';
import { SlashCommand, SlashCommandManager } from "./classes/Command";

/* Help Center */
export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');

export const loadHelpCenter = () => {
    HelpCenter;
    console.log('Help Center loaded');
};

/* SCM */
export const SCM = new SlashCommandManager();

export const loadSlashCommand = (refresh: boolean = false) => {
    const dir = path.join(rootPath, 'dist', 'handleEvent', 'interactionCreate', 'command');
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(o => o.isFile() && o.name.endsWith('.js'))
        .map(f => require(path.join(dir, f.name)))
        .filter(o => o instanceof SlashCommand)
        .forEach(c => SCM.addCommand(c, refresh));
};