import { GuildMember, Snowflake } from 'discord.js';

class Person {
    name: string;
    id: Snowflake;
    content: string = '';
    prise: number = 0;

    constructor(member: GuildMember) {
        this.name = member.nickname || member.user.username;
        this.id = member.id;
    }

    order(content: string, prise: number): boolean {
        if (this.#validatePrise(prise)) {
            this.setContent(content);
            this.setPrise(prise);
            return true;
        } else
            return false;
    }

    setContent(content: string) {
        this.content = content;
    }

    setPrise(prise: number) {
        if (prise > 0) this.prise = prise;
    }

    #validatePrise(prise: number) {
        return prise >= 0;
    }
}

export = Person;