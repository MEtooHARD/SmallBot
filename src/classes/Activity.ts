import { ActionRowBuilder } from "@discordjs/builders";
import { APIEmbed, InteractionResponse, Message } from "discord.js";
import Button from "./ActionRow/Button";
import Menu from "./ActionRow/StringSelectMenu";

class ActivityData {
    ephemeral?: boolean = false;
    content?: string;
    embeds?: APIEmbed[];
    components?: ActionRowBuilder<Button | Menu>[];
}

class Activity extends ActivityData {

    protected process: Function = () => { };
    protected next: Activity | null = null;
    /**
     * The message this activity running on;
     */
    message: Message | InteractionResponse<boolean> | null = null;

    /**
     * Create an activity which has the composition for send as a message. And has processor to handle component interactions.
     */
    constructor({ ephemeral = false, content = '', embeds = [], components = [] }: ActivityData) {
        super();
        this.setEphemeral(ephemeral);
        this.setContent(content);
        this.setEmbeds(embeds);
        this.setComponents(components);
    }

    setContent(content: string): Activity {
        this.content = content;
        return this;
    }

    setEmbeds(embeds: APIEmbed[]): Activity {
        this.embeds = embeds;
        return this;
    }

    setComponents(components: ActionRowBuilder<Button | Menu>[]): Activity {
        this.components = components;
        return this;
    }

    setEphemeral(ephemeral: boolean): Activity {
        this.ephemeral = ephemeral;
        return this;
    }

    setMessage(message: Message | InteractionResponse<boolean>): Activity {
        this.message = message;
        return this;
    }

    setProcess(callback: Function = () => { }): Activity {
        this.process = callback;
        return this;
    }

    start(): Activity {
        this.process();
        return this;
    }
}

export = Activity;