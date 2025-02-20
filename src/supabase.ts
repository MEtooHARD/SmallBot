import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './app';
import { Database } from './database.types';

// Initialize Supabase client
export const supabaseClient = createClient<Database>(
    supabaseConfig.project_url,
    supabaseConfig.ServiceKey);