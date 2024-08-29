import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Snowflake } from "discord.js";
import { supabase } from "../../supabase";

export type Material = Database['public']['Tables']['material'];

export class InmArchive {
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

    async upload(material: Material['Insert']): Promise<boolean> {
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

    static isAllowedMIMEType(type: string) {
        return InmArchive.MIMETypes.has(type);
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

    export enum MaterialStatus {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    };

    const MIMETypesString = [MIMETypes.values()].join(', ');
    export const InvalidMIMETypeMessage = `Valid MIME types:\n${MIMETypesString}`

    export const material_add_ch = supabase.channel('material_add')
};