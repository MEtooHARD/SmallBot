import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Snowflake } from "discord.js";
import { supabase } from "../../supabase";

export type MaterialIns = Database['public']['Tables']['material']['Insert'];

export const MIMETypes = [
    // 'text/plain',
    'image/gif',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/apng',
    'image/png',
    'image/svg+xml'
    // 'video/mpeg',
    // 'video/mp4',
];

export class InmArchiveManager {
    database: SupabaseClient<Database>;

    constructor(spdb: SupabaseClient<Database>) {
        this.database = spdb;
    }

    async existsUser(UID: Snowflake): Promise<boolean> {
        const { data, error } = await this.database
            .from('user').select('*')
            .eq("snowflake", UID)
            .limit(1)
        if (error) console.log(error);
        return Boolean(data?.length);
    }

    async addUser(UID: string): Promise<boolean> {
        const { error } = await supabase
            .from('user')
            .insert({ snowflake: UID });
        if (error) console.log(error);
        return !error;
    }

    async upload(material: MaterialIns): Promise<boolean> {
        const { error } = await supabase
            .from('material')
            .insert({
                name: material.name,
                content: material.content,
                type: material.type,
                uploader: material.uploader
            });
        if (error) console.log(error);
        return !error;
    }
};
