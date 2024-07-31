import { ApplicationCommandType, AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { REST, Routes } from 'discord.js';
import { session } from "../app";
import config from '../config.json';

type CommandData<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder)
    : ContextMenuCommandBuilder;

type InteractionCommandExecutor<T extends ApplicationCommandType> =
    (interaction: T extends ApplicationCommandType.ChatInput ? ChatInputCommandInteraction :
        T extends ApplicationCommandType.Message ? MessageContextMenuCommandInteraction :
        UserContextMenuCommandInteraction
    ) => Promise<void>;

type CommandAutoComplete<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (interaction: AutocompleteInteraction) => Promise<void>
    : never;

interface CommandGeneralContent<T extends ApplicationCommandType> {
    data: CommandData<T>;
    executor: InteractionCommandExecutor<T>;
};

interface CommandContent<T extends ApplicationCommandType> extends CommandGeneralContent<T> {
    complete?: CommandAutoComplete<T>;
};

export class Command<T extends ApplicationCommandType> implements CommandContent<T> {
    data: CommandData<T>;
    executor: InteractionCommandExecutor<T>;
    complete: CommandAutoComplete<T> | undefined;

    constructor({ data, executor, complete = undefined }: CommandContent<T>) {
        this.data = data;
        this.executor = executor;
        this.complete = complete;
    };
};

export class CommandManager<T extends ApplicationCommandType> {
    private _commands = new Map<string, Command<T>>();

    private getAllData() { return Array.from(this._commands.values()).map(c => c.data) };

    addCommand(command: Command<T>) {
        if (this._commands.has(command.data.name)) {
            console.log(`[SCM] duplicate command: ${command.data.name}`);
            throw new Error(`[SCM] duplicate command: ${command.data.name}`);
        }
        else
            this._commands.set(command.data.name, command);
    };

    exists(name: string) { return this._commands.has(name); };

    getCommandNames(): string[] { return Array.from(this._commands.keys()); };

    getCommand(name: string): Command<T> | undefined { return this._commands.get(name); };

    async registerAllCommands(): Promise<void> {
        const rest = new REST({ version: '10' }).setToken(config.bot[session].token);

        await rest.put(
            Routes.applicationCommands(config.bot[session].id),
            { body: this.getAllData() },
        );

        console.log(`[SCM] deployed ${this._commands.size} commands:\n${this.getCommandNames().join(',\n')}`);
    };
};
