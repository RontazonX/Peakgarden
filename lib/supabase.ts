import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vkcwjebggauutgoawlre.supabase.co';
<<<<<<< HEAD
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_9ZQdAh5vk1LIx8OcAd2jjA_oasoRI4K';
=======
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
>>>>>>> 9e82f86d14baeac1da960feb4b82a995de088107

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
