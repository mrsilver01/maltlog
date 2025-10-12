require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Supabase URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'NOT FOUND');
  console.log('Attempting to get session...');

  try {
    const { supabase } = require('../lib/supabase.ts');
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('🔴 FAILED to get session with error:', error);
    } else {
      console.log('🟢 SUCCEEDED to get session. Current session:', data.session);
    }
  } catch (e) {
    console.error('🔴 A CRITICAL exception occurred during getSession:', e);
  }
}

testConnection();