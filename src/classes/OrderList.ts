import { GuildMember, ModalBuilder } from 'discord.js';
import Person from './OrderList/Person';

class OrderList {

    members: Person[] = [];

    constructor() {

    }

    addMember(member: GuildMember): void {
        if (!this.members.find(person => person.id === member.id))
            this.members.push(new Person(member));
    }

    totalPrise(): number {
        let total = 0;
        this.members.forEach(person => { total += person.prise });
        return total;
    }

    order(person: Person, content: string, prise: number): boolean {
        return Boolean(this.members.find(p => p.id = person.id)
            ?.order(content, prise));
    }
}

export = OrderList;