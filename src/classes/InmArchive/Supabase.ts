import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../../supabase";

supabase.channel('connection')
    .subscribe(_ => { });

export class SupabaseManager {


    constructor() {

    }
}