import { ActionRowBuilder, Client, Colors, Embed, EmbedBuilder, GuildMember, TextInputBuilder, TextInputStyle, User } from 'discord.js';
import Person from './OrderList/Person';
import Modal from './Modal';
import TextInput from './TextInput';
import config from '../config.json';

const serviceCustomID: string = 'OrderList'

class OrderList {

    members: Person[] = [];
    description: string = '';


    organizer: User;
    client: Client;
    serviceName: string = 'Order List';

    constructor(user: User, client: Client) {
        this.organizer = user;
        this.client = client;
    }

    addMember(member: GuildMember): void {
        if (!this.members.find(person => person.id === member.id))
            this.members.push(new Person(member));
    }

    setDescription(description: string): void {
        this.description = description;
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

    board(): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({ name: config.bot.main.name })
            .setColor(Colors.Navy)
            .setDescription(this.description)
    }

    static creationModal(): Modal {
        return new Modal({
            customId: `[${serviceCustomID}][creation][modal]`,
            title: 'Start an Order List',
            components: [
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'theme',
                        label: 'theme',
                        placeholder: 'Put your restaurant(s) here.',
                        maxLength: 40,
                        required: true,
                    })
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'desc',
                        label: 'description',
                        placeholder: 'Write about something related to this order list',
                        style: TextInputStyle.Paragraph,
                        maxLength: 100
                    })
                )
            ]
        })
    }

    orderModal(): Modal {
        return new Modal({
            customId: `[${serviceCustomID}][order][modal]`,
            title: 'Make your order',
            components: [
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'content',
                        label: 'content',
                        style: TextInputStyle.Paragraph
                    })
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'total_prise',
                        label: 'total'
                    })
                )
            ]
        })
    }

}

export = OrderList;