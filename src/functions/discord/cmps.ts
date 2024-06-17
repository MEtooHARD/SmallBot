import { ButtonStyle } from "discord.js";
import ButtonRow from "../../classes/ActionRow/ButtonRow";

export const earn500 = (disabled: boolean = false) => [new ButtonRow([{
    customId: 'earn500',
    label: 'Earn $500',
    style: ButtonStyle.Primary,
    disabled: disabled
}])];