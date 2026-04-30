import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://hustixdjpwuqmpzspkvn.supabase.co
const supabaseAnonKey = process.env.sb_publishable_CnnasDBv9eL-_g6Jayf2bw_NMFuDDoq

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
