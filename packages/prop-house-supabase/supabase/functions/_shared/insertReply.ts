import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

export const insertReply = async (userAddress: string, proposalId: number, content: string) => {
  const supabase = createClient(
    'https://kdzewvcunwylbsiiljrg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkemV3dmN1bnd5bGJzaWlsanJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA3MDg0OTgsImV4cCI6MTk5NjI4NDQ5OH0.t8rOapKHzMrS3XHy1Z9-BuUuLByLyt-CXqBfFOJYiB0',
  );
  await supabase.from('reply').insert({
    address: userAddress,
    proposalId,
    content,
  });
};
