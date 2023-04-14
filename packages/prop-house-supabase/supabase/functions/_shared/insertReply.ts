import { client } from './client.ts';

export const insertReply = async (address: string, proposalId: number, content: string) => {
  const supabase = client();

  const { error } = await supabase.from('reply').insert({
    address,
    proposalId,
    content,
  });
  if (error) throw new Error(error.message);
};
