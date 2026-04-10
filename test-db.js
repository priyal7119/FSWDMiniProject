import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing connection with:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
  if (error) {
    console.error('Connection failed:', error.message)
  } else {
    console.log('Connection successful! Database is responding.')
  }
}

test()
