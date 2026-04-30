import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://hustixdjpwuqmpzspkvn.supabase.co
const supabaseAnonKey = process.env.sb_publishable_CnnasDBv9eL-_g6Jayf2bw_NMFuDDoq

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
