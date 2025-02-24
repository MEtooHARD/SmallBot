import { help } from "./commands/slash/help";
import { inm_archive } from './commands/slash/inm_archive/main';
import { bomb } from "./commands/slash/bomb";
import { come_in } from "./commands/slash/come_in";
import { order_list } from "./commands/slash/order_list";
import { please } from "./commands/slash/please";
import { referendum } from "./commands/slash/referendum";
import { stink } from "./commands/slash/stink";
import { t0fe } from "./commands/slash/t0fe";
import { track_chess } from "./commands/slash/track_chess";
import { test } from "./commands/slash/test";

import { CommandManager, MessageContextMenuCommand, SlashCommand, UserContextMenuCommand } from "./classes/Command";
import { ii45i4_mc } from "./commands/message/ii45i4";
import { wife } from "./commands/user/wife";
import { gay } from "./commands/user/gay";
import { Docor } from "./classes/Docor";

import path from 'node:path';
import rootPath from "get-root-path";
import { image_storage } from "./commands/slash/image_storage/command";

export const SlashCommands
    = new CommandManager<SlashCommand>([
        bomb,/*  come_in ,*/ help, /* inm_archive, order_list, */
            /*please,  referendum, */ /* stink, */ t0fe, test, track_chess,
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
