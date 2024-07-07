import { BaseInteraction, ButtonInteraction, ButtonStyle, Colors, User } from "discord.js";
import Activity from "./_Activity";
import ButtonRow from "../classes/ActionRow/ButtonRow";
import { Button } from "../classes/ActionRow/Button";
import { atUser } from "../functions/discord/mention";

enum gender { male = 'male', female = 'female' };

class Player {
    user: User;
    gender: gender = gender.male;

    constructor(user: User) {
        this.user = user;
    }

    setGender(gender: gender): Player {
        this.gender = gender;
        return this;
    }

    switchGender() {
        this.gender = (this.gender === gender.male ? gender.female : gender.male);
    }
}

class SuperMarket {
    marketer: Player;
    object: Player;

    constructor(marketer: User, object: User) {
        this.marketer = new Player(marketer);
        this.object = new Player(object);
    }

    infoPage = (): Activity => {
        const infoPage = new Activity({
            ephemeral: true,
            embeds: [
                {
                    title: 'Before you supermarket',
                    description: 'Let\'s setup some basic info',
                    color: Colors.Aqua,
                }
            ],
            components: [
                new ButtonRow([
                    new Button({
                        customId: '$marketergenderLabel',
                        label: 'You',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    }),
                    new Button({
                        customId: '$marketergender',
                        label: this.marketer.gender,
                        style: ButtonStyle.Primary
                    })
                ]),
                new ButtonRow([
                    new Button({
                        customId: '$objectgenderLabel',
                        label: 'Obj',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    }),
                    new Button({
                        customId: '$objectgender',
                        label: this.object.gender,
                        style: ButtonStyle.Primary
                    })
                ]),
                new ButtonRow([
                    new Button({
                        customId: '$startsupermarket',
                        label: 'Supermarket!',
                        style: ButtonStyle.Success
                    })
                ])
            ]
        }).setProcess(() => {
            if (infoPage.message) {
                const collector = infoPage.message.createMessageComponentCollector();

                collector.on('collect', async (interaction: BaseInteraction) => {
                    if (interaction instanceof ButtonInteraction && interaction.channel) {
                        switch (interaction.customId) {
                            case '$marketergender':
                                this.marketer.switchGender();
                                interaction.update(this.infoPage());
                                break;
                            case '$objectgender':
                                this.object.switchGender();
                                interaction.update(this.infoPage());
                                break;
                            case '$startsupermarket':
                                collector.emit('end');
                                try {
                                    interaction.update({
                                        content: 'Nice one lmao.',
                                        embeds: [],
                                        components: []
                                    });
                                } catch (e) { }
                                const superMarketPage = this.superMarketPage();
                                superMarketPage.setMessage((await interaction.channel.send(superMarketPage)));
                                superMarketPage.start();
                                break;
                        }
                    }
                });
            }
        })
        return infoPage;
    }

    superMarketPage = (): Activity => {
        const supermarket = new Activity({
            content: `${atUser(this.object.user)} 有個可憐的孤兒想要超你`,
            components: [
                new ButtonRow([
                    new Button({
                        customId: '$marketback',
                        label: '超回去',
                        style: ButtonStyle.Danger
                    }),
                    new Button({
                        customId: '$come',
                        label: '我都等不及ㄌ，快端上來罷',
                        style: ButtonStyle.Success
                    })
                ])
            ]
        }).setProcess(() => {
            if (supermarket.message) {
                const collector = supermarket.message.createMessageComponentCollector({ idle: 5 * 60 * 1000 });

                collector.on('collect', (interaction: BaseInteraction): void => {
                    if (interaction instanceof ButtonInteraction) {
                        if (interaction.user.id === this.object.user.id) {
                            let content = atUser(interaction.user);
                            switch (interaction.customId) {
                                case '$marketback':
                                    content = content.concat(' 刺激喔');
                                    break;
                                case '$come':
                                    content = content.concat(' 怎麼到處都有homo（惱')
                                    break;
                            }
                            interaction.reply({
                                content: content
                            });
                            collector.emit('end');
                            /* try {
                                interaction.message.delete();
                            } catch (e) { } */
                        } else {
                            if (interaction.user.id !== this.marketer.user.id) {
                                interaction.reply({
                                    // ephemeral: true,
                                    content: `${atUser(interaction.user)} 你看起來不像 ${atUser(this.object.user)}🧐 \n難道說... 嗯 貴圈真亂🤔 `
                                })
                            } else {
                                interaction.reply({
                                    ephemeral: true,
                                    content: '你他媽來亂的是吧'
                                })
                            }
                        }
                    }
                });

                collector.on('end', () => {
                    try {
                        if (supermarket.message)
                            supermarket.message.edit({
                                components: []
                            });
                    } catch (e) { }
                })
            }
        });
        return supermarket;
    }
}
export = SuperMarket;