import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { ChatInputValidator } from "../../../../classes/Command";
import { MediaStorage } from "../../../../classes/ImageStorage";


export const validator: ChatInputValidator = (interaction) => {
    if (MediaStorage.ConnectionStatus !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
        return [true, 'Connection to database is fucked.'];
    else {
        const subC = interaction.options.getSubcommand();
        const subG = interaction.options.getSubcommandGroup();

        if (subG === 'rename') {
            if (subC === 'image') {
                const newGroup = interaction.options.getString('new_group')?.trim();
                const newName = interaction.options.getString('new_name')?.trim();
                if (!newGroup && !newName)
                    return [false, 'One or both of `new_name` and `new_group` is required'];

                const group = interaction.options.getString('group', true).trim();
                const name = interaction.options.getString('name', true).trim();
                return [name !== newName || group !== newGroup, 'Name or group must be different.'];
            } else if (subC === 'group') {
                return [interaction.options.getString('group', true)
                    !== interaction.options.getString('new_group', true),
                    'Group name must be different.'
                ];
            }
        } else {
            if (subC === 'add') {
                const image = interaction.options.getAttachment('image', true);

                return [Boolean(image.contentType?.startsWith('image/')),
                    'File must be an image.'];
            }
            if (subC === 'get' || subC === 'remove') return [true, ''];
        }
        return [false, 'This command/subcommand is inavailable.'];
    }
}