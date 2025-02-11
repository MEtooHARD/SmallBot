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
import { Manager } from "./Basic/Manager";
import { Result } from "./GeneralTypes";

type AutoComplete = (interaction: AutocompleteInteraction) => Promise<void>

type CommandRegisterData<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder)
    : ContextMenuCommandBuilder;

type CommandInteractionType<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput ? ChatInputCommandInteraction :
    T extends ApplicationCommandType.Message ? MessageContextMenuCommandInteraction :
    UserContextMenuCommandInteraction;

export type CommandExecutor<T extends ApplicationCommandType> =
    (interaction: CommandInteractionType<T>) => Promise<void>;

export type CommandValidator<T extends ApplicationCommandType> =
    (interaction: CommandInteractionType<T>) => Result<string>;

type CommandPermissions =
    Array<(typeof PermissionFlagsBits)[keyof typeof PermissionFlagsBits]>;

abstract class AppCommand<T extends ApplicationCommandType> {
    activated: Readonly<boolean> = true;
    abstract readonly data: CommandRegisterData<T>;
    readonly requiredPerms: CommandPermissions = [];
    readonly validator: CommandValidator<T> = () => [true];
    abstract readonly executor: CommandExecutor<T>;
};

export abstract class SlashCommand extends AppCommand<ApplicationCommandType.ChatInput> {
    readonly complete: AutoComplete | undefined;
};

export abstract class MessageContextMenuCommand extends AppCommand<ApplicationCommandType.Message> { }

export abstract class UserContextMenuCommand extends AppCommand<ApplicationCommandType.User> { }

export class CommandManager<T extends ApplicationCommandType, C extends AppCommand<T>> extends Manager<C> {
    constructor(commands: (new () => C)[]) {
        super(commands.map((command) => {
            const instance = new command();
            return [instance.data.name, instance];
        }));
    };

    setActivation(name: string, status: boolean): boolean {
        const command = this.get(name);
        if (command) {
            command.activated = status;
            return true;
        } else
            return false;
    };

    isActivated(name: string): boolean { return Boolean(this.get(name)?.activated); };

    static async registerCommands(commands: AppCommand<ApplicationCommandType>[]): Promise<[boolean, any]> {
        const rest = new REST().setToken(config.bot[session].token);
        try {
            await rest.put(
                Routes.applicationCommands(config.bot[session].id),
                { body: commands.map(c => c.data) },
            );
            return [true, null];
        } catch (e) {
            return [false, e];
        }
    };
};
