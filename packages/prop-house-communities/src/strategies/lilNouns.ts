import { Strategy } from '../types/Strategy';
import { gql } from '@apollo/client';
import { client } from '../utils/client';
import { nounishDelegatedVotesToAddressQuery } from '../queries/nounishDelegatedVotesToAddressQuery';
import { lilNounsSubgraphApiUri } from '../constants/lilNounsSubgraphApiUri';

/**
 * Total delegated votes for address
 */
export const lilNouns = (multiplier: number = 1): Strategy => {
  return async (userAddress: string, communityAddress: string, blockTag: string) => {
    const result = await client(lilNounsSubgraphApiUri).query({
      query: gql(nounishDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag)),
    });

    const parsedResult = result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    return parsedResult * multiplier;
  };
};
