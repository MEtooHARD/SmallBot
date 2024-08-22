import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './app';

// Initialize Supabase client
export const supabase = createClient(
    supabaseConfig.project_url,
    supabaseConfig.APIKEY);