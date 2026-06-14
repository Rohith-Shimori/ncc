const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase Config] Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables!');
}

const getSupabaseClient = (token = null) => {
  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

const supabase = getSupabaseClient();

module.exports = {
  supabase,
  getSupabaseClient
};
