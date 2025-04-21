

type Order = {
    UID: string;
    price: number;
    quantity: number;
}

export class GrokOrder {
    private readonly guildId: string;
    private readonly channelId: string;
    private messageId: string | undefined;

    constructor(guildId: string, channelId: string) {
        this.guildId = guildId;
        this.channelId = channelId;
    }


}