import { Strategy } from '../types/Strategy';
import { gql } from '@apollo/client';
import { client } from '../utils/client';
import { nounsDelegatedVotesToAddressQuery } from '../queries/nounsQuery';
import { nounsSubgraphApiUri } from '../constants/nounsSubgraphApiUri';

/**
 * Total delegated votes for address
 */
export const nouns = (): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    multiplier: number,
    blockTag: string,
  ) => {
    const result = await client(nounsSubgraphApiUri).query({
      query: gql(nounsDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag)),
    });
    const parsedResult = result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    return parsedResult * 10;
  };
};
