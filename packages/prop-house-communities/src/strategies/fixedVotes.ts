import { Provider } from '@ethersproject/providers';
import { Strategy } from '../types/Strategy';

/**
 * Allocates `numVotes` votes to address where account === communityAddress
 */
export const fixedVotes = (numVotes: number): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => (userAddress.toLowerCase() === communityAddress.toLowerCase() ? numVotes : 0);
};
