import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { Command } from "../../classes/Command";
import data from './_data_';
import { autocomplete } from "./_autocomplete_";
import _executor_ from "./_executor_";

export = new Command<ApplicationCommandType.ChatInput>({
    data: data,
    complete: autocomplete,
    executor: _executor_,
    botPermissions: [
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ViewChannel
    ]
});