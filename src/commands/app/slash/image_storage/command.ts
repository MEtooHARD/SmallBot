import { PermissionFlagsBits } from "discord.js";
import { AutoComplete, ChatInputExecutor, ChatInputValidator, SlashCommand } from "../../../../classes/Command";
import { complete } from './complete'
import { data } from "./data";
import { add } from "./add";
import { remove } from "./remove";
import { get } from "./get";
import { list } from "./list";
import { rename } from "./rename";
import { validator } from "./validator";

export const strNotEmpty = (s: string) => (s.length > 0 && s.match(/\S+/))

export class image_storage extends SlashCommand {
    override guilds: string[] = ['1213341621542719548'];

    data = data;

    override requiredPerms: bigint[] = [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
    ];

    override verify: ChatInputValidator = validator;

    override complete: AutoComplete | undefined = complete;

    override executor: ChatInputExecutor = async (interaction) => {
        const subG = interaction.options.getSubcommandGroup() || '';
        const subC = interaction.options.getSubcommand();

        switch (`${subG} ${subC}`) {
            case ' add':
                add(interaction);
                break;
            case ' remove':
                remove(interaction);
                break;
            case ' get':
                get(interaction);
                break;
            case 'rename image':
                rename.image(interaction);
                break;
            case 'rename group':
                rename.group(interaction);
                break;
            case 'list':
                list(interaction);
                break;
        }
    };

}
