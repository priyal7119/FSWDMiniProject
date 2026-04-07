import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.error('Supabase Error: Invalid URL or Key. Check your .env file. URL should start with https://');
  }
} catch (e) {
  console.error('Supabase Initialization Error:', e);
}

export const supabase = supabaseInstance;

