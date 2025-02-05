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

type CommandAutoComplete<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (interaction: AutocompleteInteraction) => Promise<void>
    : never;

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

/*  */

export abstract class AppCommand<T extends ApplicationCommandType> {
    activated: Readonly<boolean> = true;
    abstract readonly data: CommandRegisterData<T>;
    readonly requiredPerms: CommandPermissions = [];
    readonly complete: CommandAutoComplete<T> | undefined;
    abstract readonly executor: CommandExecutor<T>;
    readonly validator: CommandValidator<T> = () => [true];
};

export class CommandManager<T extends ApplicationCommandType> extends Manager<AppCommand<T>> {
    constructor(commands: (new () => AppCommand<T>)[]) {
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

    async registerCommands(): Promise<[boolean, any]> {
        const rest = new REST().setToken(config.bot[session].token);
        try {
            await rest.put(
                Routes.applicationCommands(config.bot[session].id),
                { body: Array.from(this.vals()).map(c => c.data) },
            );
            return [true, null];
        } catch (e) {
            return [false, e];
        }
    };
};
