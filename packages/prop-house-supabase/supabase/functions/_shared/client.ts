import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

export const client = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_KEY');

  if (!supabaseUrl || !supabaseKey)
    throw new Error('Supabase URL or key not set in environment variables');

  return createClient(supabaseUrl, supabaseKey);
};
