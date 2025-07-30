import { help } from "./commands/app/slash/help";
import { inm_archive } from './commands/app/slash/inm_archive/main';
import { bomb } from "./commands/app/slash/bomb";
import { come_in } from "./commands/app/slash/come_in";
import { order_list } from "./commands/app/slash/order_list";
import { please } from "./commands/app/slash/please";
import { referendum } from "./commands/app/slash/referendum";
import { stink } from "./commands/app/slash/stink";
import { t0fe } from "./commands/app/slash/t0fe";
import { track_chess } from "./commands/app/slash/track_chess";
import { test } from "./commands/app/slash/test";

import { CommandManager, MessageContextMenuCommand, SlashCommand, UserContextMenuCommand } from "./classes/Command";
import { ii45i4_mc } from "./commands/app/message/ii45i4";
import { wife } from "./commands/app/user/wife";
import { gay } from "./commands/app/user/gay";
import { Docor } from "./classes/Docor";

import path from 'node:path';
import rootPath from "get-root-path";
import { image_storage } from "./commands/app/slash/image_storage/command";
import { zhuyin_phrases } from "./commands/app/slash/zhuyinphrases";

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
