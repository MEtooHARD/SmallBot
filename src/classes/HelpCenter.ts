import { InteractionReplyOptions, InteractionUpdateOptions } from 'discord.js';
import StringOption from './ActionRow/StringMenuOption';
import Menu from './ActionRow/StringSelectMenu';
import { MenuRow } from './ActionRow/MenuRow';
import path from 'node:path';
import fs from 'node:fs';
import Doc from './Doc';

class HelpCenter extends Doc {
    /**
     * The name to display on the message.
     */
    static DisplayName = 'Small Bot Help Center';
    /**
     * The name of HelpCneter Doc.
     */
    static Name = 'Help Center';
    constructor() {
        super(HelpCenter.Name);
    }
    /**
     * Reply message.
     * @returns The message for reply.
     */
    reply = (): InteractionReplyOptions => {
        return {
            embeds: this.embeds,
            components: [this.optionMenu],
            ephemeral: true
        }
    }
    /**
     * Update message.
     * @returns The message for update.
     */
    update = (): InteractionUpdateOptions => {
        return {
            embeds: this.embeds,
            components: [this.optionMenu]
        }
    }
    /**
     * The `StringSelectMenu`.
     * @returns `menu`
     */
    get optionMenu() {
        return new MenuRow(
            new Menu({
                customId: '$[HelpCenter]',
                placeholder: this.childs.length ?
                    'Select for more details.'
                    :
                    'There\'s no more, NO MORE!',
                options: this.options
            })
        );
    }
    /**
     * The Options of the `Doc`.
     * @returns options
     */
    get options(): StringOption[] {
        const options = this.childs.map(dirent => {
            return new StringOption({
                label: dirent.name,
                value: dirent.name,
                emoji: fs.readdirSync(path.join(dirent.path, dirent.name)).length <= 1 ? '📄' : '📁'
            })
        });
        if (this.paths.length >= 2) options.push(HelpCenter.backOption);
        if (this.paths.length >= 3) options.push(HelpCenter.homeOption);
        return options;
    }
    /**
     * The go back option.
     * @returns go back option.
     */
    static backOption = new StringOption({
        label: 'Back',
        value: 'back',
        emoji: '◀️'
    })
    /**
     * The home option.
     * @returns home option.
     */
    static homeOption = new StringOption({
        label: 'Home',
        value: 'home',
        emoji: '🏠'
    })

}

export {
    HelpCenter
};