import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

export const insertReply = async (address: string, proposalId: number, content: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey)
    throw new Error('Supabase URL or key not set in environment variables');

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase.from('reply').insert({
    address,
    proposalId,
    content,
  });
  if (error) throw new Error(error.message);
};
