import { ActionRowBuilder, AnyComponentBuilder, ButtonStyle, Client, Colors, ComponentBuilder, Embed, EmbedBuilder, GuildMember, InteractionReplyOptions, InteractionUpdateOptions, Message, MessageActionRowComponent, MessageActionRowComponentBuilder, MessageComponent, MessageComponentBuilder, MessageCreateOptions, MessagePayload, ReplyOptions, Snowflake, TextInputBuilder, TextInputStyle, User, flatten } from 'discord.js';
import Person from './Orderlist/Person'; //
import Modal from './Modal';
import TextInput from './TextInput';
import { ActionRow, Button } from './ActionRaw';


class OrderList {
    static serviceCustomID: string = 'OrderList';

    static serviceName: string = 'Order List';

    #members: Person[] = [];
    #restaurant: string = '';
    #description: string = '';

    #organizer: User;
    // #client: Client;

    constructor(user: User/* , client: Client */) {
        this.#organizer = user;
        // this.#client = client;
    }

    get memberCount(): number {
        return this.#members.length;
    }

    get organizer(): User {
        return this.#organizer;
    }

    addMember(member: GuildMember): void {
        if (!this.#members.find(person => person.id === member.id))
            this.#members.push(new Person(member));
    }

    getMember(id: Snowflake): Person | undefined {
        return this.#members.find(member => member.id === id);
    }

    setDescription(description: string): void {
        this.#description = description;
    }

    setRestaurant(restaurant: string): void {
        this.#restaurant = restaurant;
    }

    totalPrice(): number {
        let total = 0;
        this.#members.forEach(person => { total += person.price });
        return total;
    }

    order(person: Person, content: string, price: number): boolean {
        return Boolean(this.#members.find(p => p.id = person.id)
            ?.order(content, price));
    }

    board(end: boolean = false): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(end ? Colors.Green : Colors.Blue)
            .setAuthor({ name: OrderList.serviceName + `${end ? '(ended)' : ''}` })
            .setTitle(this.#restaurant)
            .setDescription(this.#description.length ? this.#description : null)
            .setFields(this.#members.map(member => {
                return {
                    name: member.name,
                    value: member.content + '\n$**' + member.price + '**',
                    inline: true
                }
            }))
            .setFooter({ text: 'Total Price: $' + this.totalPrice() })
    }

    panel(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        return [
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                new Button({
                    customId: `$[${OrderList.serviceCustomID}][order][button]`,
                    label: 'Order',
                    style: ButtonStyle.Primary
                }),
                new Button({
                    customId: `$[${OrderList.serviceCustomID}][edit][button]`,
                    label: 'Edit',
                    style: ButtonStyle.Secondary
                }),
                new Button({
                    customId: `$[${OrderList.serviceCustomID}][end][button]`,
                    label: 'End',
                    style: ButtonStyle.Secondary
                })
            ])
        ]
    }

    static creationModal(): Modal {
        return new Modal({
            customId: `[${OrderList.serviceCustomID}][creation][modal]`,
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

    orderModal(id: Snowflake): Modal {
        const member = this.getMember(id);
        return new Modal({
            customId: `$[${OrderList.serviceCustomID}][order][modal]`,
            title: 'Make your order',
            components: [
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'content',
                        label: 'content',
                        style: TextInputStyle.Paragraph,
                        value: member ? member.content : '',
                        maxLength: 300,
                        required: true
                    })
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'total_price',
                        label: 'total price',
                        value: member ? member.price.toString() : '',
                        maxLength: 10,
                        required: true
                    })
                )
            ]
        })
    }

    editModal = (): Modal => {
        return new Modal({
            customId: `$[${OrderList.serviceCustomID}][edit][modal]`,
            title: 'Edit',
            components: [
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'restaurant',
                        label: 'restaurant',
                        placeholder: 'Put your restaurant(s) here.',
                        value: this.#restaurant,
                        maxLength: 40,
                        required: true,
                    })
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInput({
                        customId: 'desc',
                        label: 'description',
                        placeholder: 'Write about something related to this order list',
                        value: this.#description,
                        style: TextInputStyle.Paragraph,
                        maxLength: 100
                    })
                )
            ]
        })
    }

    static orderFailedRpMsg(): InteractionReplyOptions {
        return {
            fetchReply: true,
            ephemeral: true,
            embeds: [
                {
                    color: Colors.Yellow,
                    description: `Order failed. Please contact metoohard.`
                }
            ]
        }
    }

    static orderSucceedRpMsg(): InteractionReplyOptions {
        return {
            fetchReply: true,
            ephemeral: true,
            embeds: [
                {
                    color: Colors.Green,
                    description: 'Order succeed!'
                }
            ]
        }
    }

    static editSuccessRpMsg = (): InteractionReplyOptions => {
        return {
            fetchReply: true,
            ephemeral: true,
            embeds: [
                {
                    color: Colors.Green,
                    description: 'Edit succeeded!'
                }
            ]
        }
    }

    static endCheckRpMsg = (): InteractionReplyOptions => {
        return {
            ephemeral: true,
            fetchReply: true,
            embeds: [
                {
                    color: Colors.Yellow,
                    description: 'Are you sure to end this order list?'
                }
            ],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new Button({
                        customId: `$[${OrderList.serviceCustomID}]`,
                        label: 'Yes',
                        style: ButtonStyle.Success
                    })
                )
            ]
        }
    }

    static notOrganizerRpMsg = (): InteractionReplyOptions => {
        return {
            fetchReply: true,
            ephemeral: true,
            embeds: [
                {
                    color: Colors.Yellow,
                    description: 'You are not the organizer.'
                }
            ]
        }
    }

    static endRpMsg = (): InteractionUpdateOptions => {
        return {
            embeds: [
                {
                    color: Colors.Green,
                    description: 'You can now dismiss this message.'
                }
            ],
            components: []
        }
    }
}

export = OrderList;