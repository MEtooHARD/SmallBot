import { Message } from "discord.js"

export class MessageFeature {
    filter(message: Message, ...params: any): boolean { return false; };
    async exe(message: Message, ...params: any): Promise<void> { };
}

export class MessageCommand extends MessageFeature {
    filter = (message: Message, param: string[]): boolean => { return false; };
    async exe(message: Message, param: string[]): Promise<void> { };
}