import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Snowflake } from "discord.js";
import { supabase } from "../../supabase";
import { Material } from './Material';

export type MaterialSchema = Database['public']['Tables']['material'];

export class InmArchive {
    static readonly Material = Material;

    static readonly database: SupabaseClient<Database> = supabase;

    static async hasUser(UID: Snowflake): Promise<boolean> {
        const { data, error } = await InmArchive.database
            .from('user').select('*')
            .eq("snowflake", UID)
            .limit(1)
        if (error) console.log(error);
        return Boolean(data?.length);
    }

    static async addUser(UID: string): Promise<boolean> {
        const { error } = await supabase
            .from('user')
            .insert({ snowflake: UID });
        if (error) console.log(error);
        return !error;
    }
};

export namespace InmArchive {
    export const MIMETypes = new Set<string>([
        'image/gif',
        'image/jpeg',
        'image/webp',
        'image/avif',
        'image/apng',
        'image/png',
        'image/svg+xml'
    ]);

    export const isListedMIMEType =
        (type: string) => MIMETypes.has(type);

    const MIMETypesStr = Array.from(MIMETypes.values()).join(', ');
    export const InvalidMIMETypesString = `Valid MIME types:\n${MIMETypesStr}`

    export const DiscordMaterialAddCh = '1279438389506080872';
};