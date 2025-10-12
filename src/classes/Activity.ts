import { GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { Result } from "./Basic/GeneralTypes";

export abstract class ChannelActivity {
    abstract readonly name: string;

    abstract onMessage(message: Message): void;

    abstract stop(): void;
}

export class ActivityManager {
    private static activities: Map<Snowflake, ChannelActivity> = new Map();

    constructor() { }

    static registerActivity<T extends ChannelActivity = ChannelActivity>(
        channel: GuildTextBasedChannel,
        ActivityConstructor: () => T
    ): Result<T, string> {
        if (channel === null) return [null, 'channel is null.'];
        if (this.activities.has(channel.id))
            return [null, `Channel is occupied by service: ${this.activities.get(channel.id)!.name}.`];

        const activity = ActivityConstructor();
        this.activities.set(channel.id, activity);
        return [activity, null];
    }

    static getActivity(channelId: Snowflake): ChannelActivity | undefined {
        const activity = this.activities.get(channelId);
        if (activity) return activity;

        return undefined;
    }

    static revokeActivity(channelId: Snowflake, activity: ChannelActivity): Result<boolean, string> {
        const existingActivity = this.activities.get(channelId);
        if (existingActivity === activity) {
            existingActivity.stop();
            this.activities.delete(channelId);
            return [true, null];
        }
        return [null, ''];
    }

    static hardRevokeActivity(channelId: Snowflake): void {
        this.activities.delete(channelId);
    }
}
