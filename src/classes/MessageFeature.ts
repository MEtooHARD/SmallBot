import { Message } from "discord.js"
import { Result } from "./Basic/GeneralTypes";

export class MessageFeature {
    static filter(message: Message, ...params: any): boolean { return false; };
    static async exe(message: Message, ...params: any): Promise<void> { };
}

type MessageCommandInfoBase = {
    command: string;
    level: string;
    params: string[];
}
type GeneralMessageCommandInfo
    = MessageCommandInfoBase & { level: 'general'; };
type DevMessageCommandInfo
    = MessageCommandInfoBase & { level: 'dev'; };
export type MessageCommandInfo = GeneralMessageCommandInfo | DevMessageCommandInfo;

export interface MessageCommand {
    name: string;
    param: {
        required: boolean;
        pattern: string;
    };
    verify?: (message: Message) => Result<true, string>;
    exe: (
        message: Message,
        command: MessageCommandInfo
    ) => Promise<Report>;
}

export namespace MessageCommand {
    const prefix = 's';
    const devPrefix = 'sd';
    const divider = '!';
    const paramsRegex = /(?:^| )(?:'([^']+)'|"([^"]+)")(?: |$)|\S+/g;

    export function parseCommand(commandStr: string): Result<MessageCommandInfo, string> {
        let command: string,
            level: MessageCommandInfo['level'],
            params: string[];
        const [pref, postterm] = commandStr.split(divider);
        if (!pref || !postterm) return [null, 'NaC'];

        if (pref === prefix) level = 'general';
        else if (pref === devPrefix) level = 'dev';
        else return [null, 'NaC'];

        [command, ...params] = postterm
            .matchAll(paramsRegex)
            .map(m => m[2] || m[0])
            .toArray();

        return [{
            command,
            level,
            params
        }, null];
    }
}

export type Report = {
    success: boolean;
    handled?: boolean;
    message?: string;
    error?: Error | null;
    metadata?: Record<string, any>;
}
