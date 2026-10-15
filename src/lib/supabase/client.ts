import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://deojsgulvlyvskztfgfc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlb2pzZ3Vsdmx5dnNrenRmZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg4MzgsImV4cCI6MjA4OTI5NDgzOH0.owPzJWrabPU_Jm_W_I2mJ6BkOIodFKUFe6J6kUKfDJ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

