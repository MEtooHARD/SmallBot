import { Message } from 'discord.js';
import { shouldRpMsg } from '../functions/config/shouldReply';
import Selecter from './messageCreate/Selecter';

const create = async (message: Message): Promise<void> => {
    if (shouldRpMsg(message))
        Selecter.exe(message);
};

export = create;