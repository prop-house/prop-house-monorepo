import { client } from '../subgraph/client';
import { nounsDelegatedVotesToAddressQuery } from '../subgraph/nounsQuery';
import { gql } from '@apollo/client';
import { Contract } from './types';

/**
 * Contracts of communities that an alternative appraoch to a `balanceOf` call to calculate votes.
 */
export const contracts: Contract[] = [
  {
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    numVotes: async (userAddress: string) => {
      const result = await client.query({
        query: gql(nounsDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase())),
      });

      return result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    },
    multiplier: 10,
  },
];
