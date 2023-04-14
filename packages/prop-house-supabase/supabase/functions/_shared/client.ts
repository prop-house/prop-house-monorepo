import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

export const client = () => {
  let supabaseUrl;
  let supabaseKey;

  if (Deno.env.get('SUP_URL_LOCAL')) {
    supabaseUrl = Deno.env.get('SUP_URL_LOCAL');
    supabaseKey = Deno.env.get('SUP_KEY_LOCAL');
  } else {
    supabaseUrl = Deno.env.get('SUPABASE_URL');
    supabaseKey = Deno.env.get('SUPABASE_KEY');
  }

  if (!supabaseUrl || !supabaseKey)
    throw new Error('Supabase URL or key not set in environment variables');

  return createClient(supabaseUrl, supabaseKey);
};
