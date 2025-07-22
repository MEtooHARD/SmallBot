import {
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    PermissionFlagsBits,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    Snowflake,
    UserContextMenuCommandInteraction
} from "discord.js";
import { REST, Routes } from 'discord.js';
import { session } from "../app";
import config from '../config.json';
import { Manager } from "./Basic/Manager";
import { Result_ } from "./Basic/GeneralTypes";
import { biSplitArray, groupElements } from "../functions/general/array";

export type AutoComplete = (interaction: AutocompleteInteraction) => Promise<void>

type CommandRegisterData<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput
    ? (SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder)
    : ContextMenuCommandBuilder;

export type ChatInputExecutor = (interaction: ChatInputCommandInteraction) => Promise<void>;
export type MessageContextMenuExecutor = (interaction: MessageContextMenuCommandInteraction) => Promise<void>;
export type UserContextMenuExecutor = (interaction: UserContextMenuCommandInteraction) => Promise<void>;

export type CommandExecutor<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput ? ChatInputExecutor :
    T extends ApplicationCommandType.Message ? MessageContextMenuExecutor :
    T extends ApplicationCommandType.User ? UserContextMenuExecutor :
    never;

export type ChatInputValidator = (interaction: ChatInputCommandInteraction) => Result_<string, string>;
export type MessageContextMenuValidator = (interaction: MessageContextMenuCommandInteraction) => Result_<string, string>;
export type UserContextMenuValidator = (interaction: UserContextMenuCommandInteraction) => Result_<string, string>;

type CommandValidator<T extends ApplicationCommandType> =
    T extends ApplicationCommandType.ChatInput ? ChatInputValidator :
    T extends ApplicationCommandType.Message ? MessageContextMenuValidator :
    T extends ApplicationCommandType.User ? UserContextMenuValidator :
    never;

type CommandPermissions =
    Array<(typeof PermissionFlagsBits)[keyof typeof PermissionFlagsBits]>;

type Guilds = Snowflake[];

abstract class AppCommand<T extends ApplicationCommandType> {
    activated: Readonly<boolean> = true;
    abstract readonly data: CommandRegisterData<T>;
    readonly requiredPerms: CommandPermissions = [];
    readonly guilds: Guilds = [];
    readonly validator: CommandValidator<T> = ((interaction: any) => [true]) as CommandValidator<T>;
    abstract readonly executor: CommandExecutor<T>;
};

export abstract class SlashCommand extends AppCommand<ApplicationCommandType.ChatInput> {
    readonly complete: AutoComplete | undefined;
};

export abstract class MessageContextMenuCommand extends AppCommand<ApplicationCommandType.Message> { }

export abstract class UserContextMenuCommand extends AppCommand<ApplicationCommandType.User> { }

export class CommandManager
    <C extends AppCommand<ApplicationCommandType>>
    extends Manager<C> {
    constructor(commands: (new () => C)[]) {
        super(commands.map((command) => {
            const instance = new command();
            return [instance.data.name, instance];
        }));
    };

    setActivated(name: string, status: boolean): boolean {
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

        const [global, dedicated] = biSplitArray(commands, c => c.guilds.length === 0);

        try {
            await rest.put(
                Routes.applicationCommands(config.bot[session].id),
                { body: global.map(c => c.data) },
            );

            groupElements(dedicated, function* (c) { yield* c.guilds })
                .forEach(async ([guild, commands]) => {
                    await rest.put(
                        Routes.applicationGuildCommands(config.bot[session].id, guild),
                        { body: commands.map(c => c.data) },
                    );
                });

            return [true, null];
        } catch (e) {
            console.error(e);
            return [false, e];
        }
    };
};
