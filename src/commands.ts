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

import { CommandManager } from "./classes/Command";
import { ApplicationCommandType } from "discord.js";

export const SlashCommands =
    new CommandManager<ApplicationCommandType.ChatInput>(
        [bomb, come_in, help, /* inm_archive, */ order_list,
            please, referendum, stink, t0fe, test, track_chess]
    );
// export const MessageMenuCommands = new CommandManager<ApplicationCommandType.Message>([]);
// export const UserMenuCommands = new CommandManager<ApplicationCommandType.User>([]);