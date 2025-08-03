import { Snowflake } from "discord.js";


export enum ActivityStatus { normal, occupied }

interface ChannelActivity {
    interruptible: boolean;
}

type ActivityRegistration = {
    activity: ChannelActivity;
    startTime: number;
}

export class ChannelActivityManager {
    private activities: Map<Snowflake, ActivityRegistration> = new Map();

    constructor() { }

    setActivity(channelId: Snowflake, activity: ChannelActivity): void {
        this.activities.set(channelId, {
            activity,
            startTime: Date.now()
        });
    }

}