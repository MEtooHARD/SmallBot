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
import { Manager } from "./Manager";

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

/* export class CommandWrapper<T extends ApplicationCommandType> {
    private command: Command<T>;
    private activated: boolean;

    constructor(command: Command<T>, activated: boolean = true) {
        this.command = command;
        this.activated = activated;
    };

    get data() {
        return this.command.data;
    };

    get executor() {
        return this.command.executor;
    };
}; */

export class CommandManager<T extends ApplicationCommandType> extends Manager<Command<T>> {
    private activation: Map<string, boolean> = new Map<string, boolean>();

    constructor(commands: [string, Command<T>][]) {
        super(commands);
        [...this.items.keys()].forEach(key => this.activation.set(key, true));
    };

    setActivation(name: string, status: boolean): boolean {
        if (this.items.has(name)) {
            this.activation.set(name, status);
            return true;
        } else
            return false;
    };

    isActivated(name: string): boolean { return Boolean(this.activation.get(name)); };

    async registerCommands(): Promise<[boolean, any]> {
        const rest = new REST().setToken(config.bot[session].token);
        try {
            await rest.put(
                Routes.applicationCommands(config.bot[session].id),
                { body: Array.from(this.items.values()).map(c => c.data) },
            );
            return [true, null];
        } catch (e) {
            return [false, e];
        }
    };
};

class DevCommand<T extends ApplicationCommandType> extends Command<T> {

}
