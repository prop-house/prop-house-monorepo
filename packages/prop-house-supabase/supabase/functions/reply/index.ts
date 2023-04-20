import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Buffer from 'https://deno.land/std@0.110.0/node/buffer.ts';
import prophouse from 'https://esm.sh/@prophouse/communities@0.1.5';
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

  const provider = new ethers.providers.InfuraProvider(1, INFURA_PROJECT_ID);
  const value = await req.json();
  const { address, communityAddress, blockTag, proposalId, content } = value;

  const message = Buffer.Buffer.from(value.signedData.message, 'base64').toString('utf8');
  const { isValidAccountSig, accountSigError } = verifyAccountSignature(message, value);
  if (!isValidAccountSig) {
    return new Response(
      JSON.stringify({ error: `EOA signature invalid. Error message: ${accountSigError}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  let isProposer;
  try {
    isProposer = await _isProposer(address, proposalId);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Error fetching voting power. Error message: ${error}`,
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
        error: `Error fetching voting power.  Error message: ${error}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  const canReply = isProposer || votingPower > 0;

  if (!canReply)
    return new Response(
      JSON.stringify({
        message: `Account is not authortized to reply. Account must be a proposer or have voting power.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
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
