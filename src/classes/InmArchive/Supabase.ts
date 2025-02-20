import { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseClient } from "../../supabase";

supabaseClient.channel('connection')
    .subscribe(_ => { });

export class SupabaseManager {


    constructor() {

    }
}