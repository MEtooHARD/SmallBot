import {
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    PermissionFlagsBits,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    UserContextMenuCommandInteraction
} from "discord.js";
import { REST, Routes } from 'discord.js';
import { session } from "../app";
import config from '../config.json';

type CommandAutoComplete<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (interaction: AutocompleteInteraction) => Promise<void>
    : never;

type CommandData<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder)
    : ContextMenuCommandBuilder;

type CommandInteractionType<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput ? ChatInputCommandInteraction :
    T extends ApplicationCommandType.Message ? MessageContextMenuCommandInteraction :
    UserContextMenuCommandInteraction;

type CommandExecutor<T extends ApplicationCommandType> =
    (interaction: CommandInteractionType<T>) => Promise<void>;

type CommandFilter<T extends ApplicationCommandType> =
    (interaction: CommandInteractionType<T>) => boolean;

type CommandPermissions =
    Array<(typeof PermissionFlagsBits)[keyof typeof PermissionFlagsBits]>;

interface CommandGeneralContent<T extends ApplicationCommandType> {
    complete?: CommandAutoComplete<T>;
    data: CommandData<T>;
    executor: CommandExecutor<T>;
};

interface CommandContent<T extends ApplicationCommandType> extends CommandGeneralContent<T> {
    filter: CommandFilter<T>;
    permissions: Readonly<CommandPermissions>;
}

interface CommandCreateOptions<T extends ApplicationCommandType> extends CommandGeneralContent<T> {
    filter?: CommandFilter<T>;
    permissions?: Readonly<CommandPermissions>;
};

export class Command<T extends ApplicationCommandType> implements CommandContent<T> {
    readonly complete: CommandAutoComplete<T> | undefined;
    readonly data: CommandData<T>;
    readonly executor: CommandExecutor<T>;
    readonly filter: CommandFilter<T>;
    readonly permissions: Readonly<CommandPermissions>;

    constructor({ data, executor, complete = undefined, filter, permissions }: CommandCreateOptions<T>) {
        this.complete = complete;
        this.data = data;
        this.executor = executor;
        this.filter = filter || ((interaction: CommandInteractionType<T>) => true);
        this.permissions = permissions || [];
    };
};

export class CommandManager<T extends ApplicationCommandType> {
    private readonly _commands = new Map<string, Command<T>>();
    private getAllData() { return Array.from(this._commands.values()).map(c => c.data) };

    addCommand(command: Command<T>): void {
        if (this._commands.has(command.data.name)) {
            console.log(`[Command Manager] duplicate command: ${command.data.name}`);
            throw new Error(`[Command Manager] duplicate command: ${command.data.name}`);
        } else {
            this._commands.set(command.data.name, command);
        }
    };

    rmCommand(name: string): boolean { return this._commands.delete(name); };

    exists(name: string) { return this._commands.has(name); };

    getCommandNames(): string[] { return Array.from(this._commands.keys()); };

    getCommand(name: string): Command<T> | undefined { return this._commands.get(name); };

    async registerAllCommands(): Promise<void> {
        const rest = new REST({ version: '10' }).setToken(config.bot[session].token);

        await rest.put(
            Routes.applicationCommands(config.bot[session].id),
            { body: this.getAllData() },
        );

        console.log(`[Command Manager] deployed ${this._commands.size} commands:\n${this.getCommandNames().join(',\n')}`);
    };
};
