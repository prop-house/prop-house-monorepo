import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

export const insertReply = async (address: string, proposalId: number, content: string) => {
  const supabaseUrl = 'https://kdzewvcunwylbsiiljrg.supabase.co';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseLocalAnonKey = Deno.env.get('LOCAL_ANON_KEY');
  const isLocal = Deno.env.get('SUPABASE_URL')?.includes('8000');
  const key = isLocal ? supabaseLocalAnonKey : supabaseServiceRoleKey;

  if (!supabaseUrl || !key) throw new Error('Supabase URL or key not set in environment variables');

  const supabase = createClient(supabaseUrl, key!);
  const { error } = await supabase.from('reply').insert({
    address,
    proposalId,
    content,
  });
  if (error) throw new Error(error.message);
};
