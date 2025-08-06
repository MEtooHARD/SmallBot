import { GuildTextBasedChannel, Message, Snowflake } from "discord.js";
import { v4 } from "uuid";
import { Result } from "./Basic/GeneralTypes";

export abstract class Activity {
    // readonly location: ChannelLocation;

    constructor(
        readonly channel: GuildTextBasedChannel,
        readonly token: string
    ) { }

    abstract onMessage(message: Message): void;

    abstract stop(): void;
}

export class ActivityManager {
    private static activities: Map<Snowflake, Activity> = new Map();

    constructor() { }

    static registerActivity<T extends Activity = Activity>(
        channel: GuildTextBasedChannel,
        ActivityConstructor: new (channel: GuildTextBasedChannel, token: string) => T
    ): Result<T, string> {
        if (channel === null) return [null, 'channel is null.'];
        if (this.activities.has(channel.id)) return [null, 'Channel is occupied.'];

        const token = v4();
        const activity = new ActivityConstructor(channel, token);
        this.activities.set(channel.id, activity);
        return [activity, null];
    }

    static getActivity(channelId: Snowflake): Activity | undefined {
        const activity = this.activities.get(channelId);
        if (activity) return activity;

        return undefined;
    }

    static revokeActivity(channelId: Snowflake, activity: Activity): Result<boolean, string> {
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
