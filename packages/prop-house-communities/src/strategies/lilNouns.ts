import { Strategy } from '../types/Strategy';
import { gql } from '@apollo/client';
import { nounishDelegatedVotesToAddressQuery } from '../queries/nounishDelegatedVotesToAddressQuery';
import { lilNounsSubgraphApiUri } from '../constants/lilNounsSubgraphApiUri';

/**
 * Total delegated votes for address
 */
export const lilNouns = (multiplier: number = 1): Strategy => {
  return async (userAddress: string, communityAddress: string, blockTag: number) => {
    const query = gql(
      nounishDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag),
    ).loc?.source.body;

    const response = await fetch(lilNounsSubgraphApiUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const parsedResult = result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    return parsedResult * multiplier;
  };
};
