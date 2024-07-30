import { CacheType, ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { REST, Routes } from 'discord.js';
import { session } from "../app";
import config from '../config.json';

interface SlashCommandContent {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
};

export class SlashCommand implements SlashCommandContent {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;

    constructor({ data, execute }: SlashCommandContent) {
        this.data = data;
        this.execute = execute;
    };
};

export class SlashCommandManager {
    private _commands = new Map<string, SlashCommand>();

    private getAllData() { return Array.from(this._commands.values()).map(c => c.data) };

    addCommand(command: SlashCommand, refresh: boolean = false) {
        if (this._commands.has(command.data.name) && !refresh)
            throw new Error(`[SCM] duplicate command: ${command.data.name}`);
        else
            this._commands.set(command.data.name, command);
    };

    exists(name: string) { };

    getCommandNames(): string[] { return Array.from(this._commands.keys()); };

    getCommand(name: string): SlashCommand | undefined { return this._commands.get(name); };

    async registerAllCommands(): Promise<void> {
        const rest = new REST({ version: '10' }).setToken(config.bot[session].token);

        await rest.put(
            Routes.applicationCommands(config.bot[session].id),
            { body: this.getAllData() },
        );

        console.log(`[SCM] deployed ${this._commands.size} commands:\n${this.getCommandNames().join(',\n')}`);
    };
};
