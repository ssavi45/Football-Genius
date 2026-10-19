export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase-not-configured.invalid';
export const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'supabase-not-configured';
export const supabaseConfigured = supabaseUrl !== 'https://supabase-not-configured.invalid' && supabasePublicKey !== 'supabase-not-configured';
