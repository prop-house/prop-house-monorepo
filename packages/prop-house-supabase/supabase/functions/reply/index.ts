import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import prophouse from 'https://esm.sh/@prophouse/communities@0.1.4';
import { ethers } from 'https://esm.sh/ethers@5.7.2';
import { isProposer as _isProposer } from '../_shared/isProposer.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const provider = new ethers.providers.JsonRpcProvider('99fa8a6adf2f4215ba86661c36cb7e84');
  const { userAddress, communityAddress, blockTag, proposalId } = await req.json();

  const hasVotingPower = await prophouse.getVotingPower(
    userAddress,
    communityAddress,
    provider,
    blockTag,
  );
  const isProposer = await _isProposer(userAddress, proposalId);

  const data = {
    canReply: isProposer || hasVotingPower > 0,
  };

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
