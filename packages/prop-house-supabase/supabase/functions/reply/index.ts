import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Buffer from 'https://deno.land/std@0.110.0/node/buffer.ts';
import prophouse from 'https://esm.sh/@prophouse/communities@0.1.4';
import { ethers } from 'https://esm.sh/ethers@5.7.2';
import { isProposer as _isProposer } from '../_shared/isProposer.ts';
import { insertReply } from '../_shared/insertReply.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAccountSignature } from '../_shared/verifyAccountSignature.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const INFURA_PROJECT_ID = Deno.env.get('INFURA_PROJECT_ID');

  const provider = new ethers.providers.JsonRpcProvider(INFURA_PROJECT_ID);
  const value = await req.json();
  const { address, communityAddress, blockTag, proposalId, content } = value;

  const message = Buffer.Buffer.from(value.signedData.message, 'base64').toString('utf8');
  const { isValidAccountSig, accountSigError } = verifyAccountSignature(message, value);
  if (!isValidAccountSig) {
    return new Response(
      JSON.stringify({ error: `EOA signature invalid. error: ${accountSigError}` }),
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
