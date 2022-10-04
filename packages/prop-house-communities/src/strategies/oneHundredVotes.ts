import { Provider } from '@ethersproject/providers';
import { Strategy } from '../types/Strategy';

/**
 * Allocates 100 votes to all users (to be used for development purposes)
 */
export const oneHundredVotes = (): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => 100;
};
