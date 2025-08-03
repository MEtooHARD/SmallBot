import { bomb } from "./commands/app/slash/bomb";
import { help } from "./commands/app/slash/help";
import { order_list } from "./commands/app/slash/order_list";
import { t0fe } from "./commands/app/slash/t0fe";
import { test } from "./commands/app/slash/test";
import { track_chess } from "./commands/app/slash/track_chess";

import { CommandManager, MessageContextMenuCommand, SlashCommand, UserContextMenuCommand } from "./classes/Command";
import { Docor } from "./classes/Docor";
import { ii45i4_mc } from "./commands/app/message/ii45i4";
import { gay } from "./commands/app/user/gay";
import { wife } from "./commands/app/user/wife";

import rootPath from "get-root-path";
import path from 'node:path';

export const SlashCommands
    = new CommandManager<SlashCommand>([
        bomb,/*  come_in ,*/ help, /* inm_archive,*/ order_list,
            /*please,  referendum, */ /* stink, */ t0fe, test, track_chess/* , zhuyin_phrases */
        /* image_storage */
    ]);

export const MessageMenuCommands
    = new CommandManager<MessageContextMenuCommand>([
        ii45i4_mc
    ]);

export const UserMenuCommands
    = new CommandManager<UserContextMenuCommand>([
        wife, gay
    ]);

export const HelpCenter = new Docor(path.join(rootPath, 'dist', 'docs'), 'Help Center');
