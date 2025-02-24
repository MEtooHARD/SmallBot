import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { supabaseClient } from "../supabase";
import chalk from "chalk";
import { APIEmbed, Collection, Colors, Snowflake } from "discord.js";
import { Database } from "../database.types";
import { timestamp } from "../functions/general/log";



type Image = Database['public']['Tables']['image_storage']['Row'] & { id?: string };

class ImageStorageCache {
    protected readonly _guilds: Collection<Snowflake, ImageStorageGuild> = new Collection();

    list(): Snowflake[] { return [...this._guilds.keys()]; }

    getGuild(guild_id: Snowflake) { return this._guilds.get(guild_id); }
}

class ImageStorageGuild {
    readonly groups: Collection<string, ImageStorageGroup> = new Collection();
    protected _lastUpdated: Date = new Date(Date.now());

    get lastUpdated() { return this._lastUpdated; }

    list(): string[] { return [...this.groups.keys()]; }

    getGroup(group: string) { return this.groups.get(group); }
}

class ImageStorageGroup {
    readonly images: Collection<string, Image> = new Collection();
    protected _lastUpdated: Date = new Date(Date.now());

    get lastUpdated() { return this._lastUpdated; }

    list(): string[] { return [...this.images.keys()]; }

    getImage(name: string) { return this.images.get(name); }
}

export class MediaStorage {
    private static _ConnectionStatus = REALTIME_SUBSCRIBE_STATES.CLOSED;
    // public static cache: ImageStorageCache = new ImageStorageCache();

    static get ConnectionStatus() { return MediaStorage._ConnectionStatus; }

    public static init() {
        console.log(timestamp(), '[MediaStorage] Initialize');
        supabaseClient
            .channel('image_storage')
            .subscribe(MediaStorage.ConnectionStatusChange);
    }

    private static ConnectionStatusChange(s: REALTIME_SUBSCRIBE_STATES) {
        MediaStorage._ConnectionStatus = s;
        console.log(chalk.bgBlackBright(new Date().toISOString()), '[MediaStorage] Connection >', s);
    }

    public static getImage(
        guild_id: string,
        group: string,
        name: string
    ) {
        return supabaseClient
            .rpc('image_storage_get_image',
                { name_: name, group_: group, guildid: guild_id });
    }

    public static getImageUrl(
        guild_id: Snowflake,
        group: string,
        name: string
    ) {
        return supabaseClient
            .rpc('image_storage_get_image_url',
                { guildid: guild_id, group_: group, name_: name });
    }

    public static searchGroups(guild_id: Snowflake) {
        return supabaseClient
            .rpc('image_storage_get_groups', { guildid: guild_id });
    }

    public static searchNameByGroup(
        guild_id: Snowflake,
        group: string,
        name: string
    ) {
        return supabaseClient
            .rpc('image_storage_get_name_by_group',
                { guildid: guild_id, group_: group, name_: name });
    }

    public static existsImage(
        guild_id: Snowflake,
        group: string,
        name: string
    ) {
        return supabaseClient
            .rpc('image_storage_exists_image',
                { guildid: guild_id, group_: group, name_: name });
    }

    public static existsGroup(
        guild_id: Snowflake,
        group: string,
    ) {
        return supabaseClient
            .rpc('image_storage_exists_group',
                { guildid: guild_id, group_: group });
    }

    public static getImageCountOfGroup(
        guild_id: Snowflake,
        group: string
    ) {
        return supabaseClient
            .rpc('image_storage_get_image_count_of_group',
                { guildid: guild_id, group_: group });
    }

    public static addImage({
        guild_id,
        name,
        group,
        url
    }: Database['public']['Tables']['image_storage']['Insert']) {
        return supabaseClient
            .from('image_storage')
            .insert({
                guild_id: guild_id,
                name: name,
                group: group,
                url: url
            });
    }

    public static removeImage(
        guild_id: Snowflake,
        group: string,
        name: string) {
        return supabaseClient
            .from('image_storage')
            .delete()
            .eq('guild_id', guild_id)
            .eq('group', group)
            .eq('name', name)
            .select()
            .single();
    }

    public static updateImage(
        guild_id: Snowflake,
        group: string,
        name: string,
        new_group: string,
        new_name: string,
    ) {
        return supabaseClient
            .from('image_storage')
            .update({ name: new_name, group: new_group })
            .eq('guild_id', guild_id)
            .eq('group', group)
            .eq('name', name)
            .select('url')
            .single();
    }

    public static updateGroup(
        guild_id: Snowflake,
        group: string,
        new_group: string,
    ) {
        return supabaseClient
            .rpc('image_storage_update_group',
                { guildid: guild_id, group_: group, new_group: new_group });
    }

    public static imageDisplay(
        name: string,
        group: string,
        url: string,
    ): APIEmbed {
        return {
            color: Colors.Green,
            author: { name: 'Image Storage' },
            fields: [
                { name: 'Name', value: name, inline: true },
                { name: 'Group', value: group, inline: true },
            ],
            image: { url: url }
        }
    }
}
