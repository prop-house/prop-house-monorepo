import { Strategy } from '../types/Strategy';
import { gql } from '@apollo/client';
import { client } from '../utils/client';
import { nounishDelegatedVotesToAddressQuery } from '../queries/nounishDelegatedVotesToAddressQuery';
import { nounsSubgraphApiUri } from '../constants/nounsSubgraphApiUri';
import { strategyForRound } from '../utils/strategyForRound';

/**
 * Total delegated votes for address
 */
export const nouns = (multiplier: number = 1): Strategy => {
  return async (userAddress, communityAddress, blockTag, provider, roundId) => {
    if (roundId) {
      const strat = strategyForRound(roundId, communityAddress);
      if (strat) return strat(userAddress, communityAddress, blockTag, provider, roundId);
    }

    const result = await client(nounsSubgraphApiUri).query({
      query: gql(nounishDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag)),
    });
    const parsedResult = result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    return parsedResult * multiplier;
  };
};
