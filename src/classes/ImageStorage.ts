import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { supabaseClient } from "../supabase";
import chalk from "chalk";
import { APIEmbed, Colors, Snowflake } from "discord.js";
import { Database } from "../database.types";

export class ImageStorage {
    private static _ConnectionStatus = REALTIME_SUBSCRIBE_STATES.CLOSED;

    static get ConnectionStatus() { return ImageStorage._ConnectionStatus; }

    public static init() {
        supabaseClient
            .channel('image_storage')
            .subscribe(ImageStorage.ChangeConnectionStatus);
    }

    public static ChangeConnectionStatus(s: REALTIME_SUBSCRIBE_STATES) {
        ImageStorage._ConnectionStatus = s;
        console.log(chalk.bgBlackBright(new Date().toISOString()),
            '\n[ImageStorage] Connection > ', s);
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

    // public static getImages(guild_id: Snowflake, group: string) {
    //     return supabaseClient
    //         .from('image_storage')
    //         .select('name, group, url')
    //         .eq('guild_id', guild_id)
    //         .eq('group', group)
    //         .limit(20);
    // }

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