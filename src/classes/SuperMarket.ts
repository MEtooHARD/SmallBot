import { BaseInteraction, ButtonInteraction, ButtonStyle, Colors, User } from "discord.js";
import Activity from "./Activity";
import ButtonRow from "./ActionRow/ButtonRow";
import Button from "./ActionRow/Button";

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

                collector.on('collect', (interaction: BaseInteraction) => {
                    if (interaction instanceof ButtonInteraction) {
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
                                interaction.channel?.send({
                                    content: ''
                                });
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
            embeds: [
                {
                    
                }
            ]
        });
        return supermarket;
    }
}
export = SuperMarket;