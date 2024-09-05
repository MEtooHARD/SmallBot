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
import { StaticManager } from "./StaticManager";

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
    botPermissions: CommandPermissions;
}

interface CommandCreateOptions<T extends ApplicationCommandType> extends CommandGeneralContent<T> {
    filter?: CommandFilter<T>;
    botPermissions?: CommandPermissions;
};

export class Command<T extends ApplicationCommandType> implements CommandContent<T> {
    readonly complete: CommandAutoComplete<T> | undefined;
    readonly data: CommandData<T>;
    readonly executor: CommandExecutor<T>;
    readonly filter: CommandFilter<T>;
    readonly botPermissions: CommandPermissions;

    constructor({ complete = undefined, data, executor, filter, botPermissions }: CommandCreateOptions<T>) {
        this.complete = complete;
        this.data = data;
        this.executor = executor;
        this.filter = filter || ((i: CommandInteractionType<T>) => true);
        this.botPermissions = botPermissions || [];
    };
};

export class CommandManager<T extends ApplicationCommandType> extends StaticManager<Command<T>> {

    private getAllData() { return Array.from(this.items.values()).map(c => c.data) };

    async registerCommands(): Promise<[boolean, any]> {
        const rest = new REST().setToken(config.bot[session].token);
        try {
            await rest.put(
                Routes.applicationCommands(config.bot[session].id),
                { body: this.getAllData() },
            );
            return [true, null];
        } catch (e) {
            return [false, e];
        }
    };
};
