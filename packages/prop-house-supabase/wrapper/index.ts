import { createClient } from '@supabase/supabase-js';

export const submitReply = async (content: string) => {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase URL or Key');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data, error } = await supabase.functions.invoke('reply', {
    body: {
      userAddress: '0xba2b9804FbffA8F1A8F7DC8dd600E21268beF09F',
      communityAddress: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
      blockTag: 16961807,
      proposalId: 5516,
      content: content,
    },
  });
  if (error) throw error;
  return data;
};
