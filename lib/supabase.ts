import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vkcwjebggauutgoawlre.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_9ZQdAh5vk1LIx8OcAd2jjA_oasoRI4K';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
