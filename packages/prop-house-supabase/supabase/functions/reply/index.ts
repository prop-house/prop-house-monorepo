import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Buffer from 'https://deno.land/std@0.110.0/node/buffer.ts';
import prophouse from 'https://esm.sh/@prophouse/communities@0.1.4';
import { ethers } from 'https://esm.sh/ethers@5.7.2';
import { isProposer as _isProposer } from '../_shared/isProposer.ts';
import { insertReply } from '../_shared/insertReply.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const INFURA_PROJECT_ID = Deno.env.get('INFURA_PROJECT_ID');

  const provider = new ethers.providers.JsonRpcProvider(INFURA_PROJECT_ID);
  const { address, communityAddress, blockTag, proposalId, content, signedData } = await req.json();

  let recoveredAddress;
  try {
    recoveredAddress = ethers.utils.verifyMessage(
      Buffer.Buffer.from(signedData.message, 'base64').toString('utf8'),
      signedData.signature,
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `error recovering address from message. error: ${error}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    return new Response(
      JSON.stringify({
        error: `The recovered address from signed message does not match the address.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  let votingPower;
  try {
    votingPower = await prophouse.getVotingPower(address, communityAddress, provider, blockTag);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Error fetching voting power. ${error}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  const isProposer = await _isProposer(address, proposalId);

  const canReply = isProposer || votingPower > 0;

  if (!canReply)
    return new Response(
      JSON.stringify({ error: `${address} is not allowed to reply to proposal ${proposalId}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      },
    );

  try {
    await insertReply(address, proposalId, content);
    return new Response(
      JSON.stringify({ success: `${address} added a reply to proposal ${proposalId}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `error inserting reply into db. error: ${error}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
