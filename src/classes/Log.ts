import { BitField, EnumLike, Events, User } from 'discord.js';

class Log {
    event: string;
    user: User;
    message: string = '';
    functionName: string = '';

    constructor({ event, user }:
        { event: string, user: User }) {
        this.event = event;
        this.user = user;
    }

    append(content: string) {
        this.message = this.message.concat(content + '\n');
    }

    setFunctionName(name: string) {
        this.functionName = name;
    }

    log() {
        console.log(`[${this.event}][${this.functionName}][${this.user.username}]\n${this.message}`);
    }
}

export = Log;