import { Strategy } from '../types/Strategy';
import { gql } from '@apollo/client';
import { client } from '../utils/client';
import { nounsDelegatedVotesToAddressQuery } from '../queries/nounsQuery';
import { communityAddresses } from '../addresses';

/**
 * Total delegated votes for address
 */
export const nouns: Strategy = {
  address: communityAddresses.nouns,
  numVotes: async (
    userAddress: string,
    provider,
    commmunityAddress,
    blockTag: string = 'latest',
  ) => {
    const result = await client.query({
      query: gql(nounsDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag)),
    });

    return result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
  },
  multiplier: 10,
};
