import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import prophouse from 'https://esm.sh/@prophouse/communities@0.1.3';
import { ethers } from 'https://esm.sh/ethers@5.7.2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const provider = new ethers.providers.JsonRpcProvider('99fa8a6adf2f4215ba86661c36cb7e84');
  const { userAddress, communityAddress, blockTag, proposalId } = await req.json();

  try {
    const hasVotingPower = await prophouse.getVotingPower(
      userAddress,
      communityAddress,
      provider,
      blockTag,
    );
    console.log('has voting power');
    console.log(hasVotingPower);
  } catch (e) {
    console.log('error cetching voting power: ', e);
  }

  const _isProposer = await isProposer(userAddress, proposalId);

  const data = {
    canVote: _isProposer,
  };

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});

const isProposer = async (address: string, proposalId: number) => {
  const query = `
      query {
        proposal(id: ${proposalId}) {
        address
      }
    }`;

  const requestOptions: RequestInit = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  };

  try {
    const response = await fetch('https://prod.backend.prop.house/graphql', requestOptions);
    const data = await response.json();
    return data.data.proposal.address === address;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};
