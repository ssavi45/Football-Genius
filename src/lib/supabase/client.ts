'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabasePublicKey } from './config';

export const supabase = createBrowserClient(supabaseUrl, supabasePublicKey);
