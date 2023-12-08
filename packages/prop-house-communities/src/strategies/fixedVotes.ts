import { Provider } from '@ethersproject/providers';
import { Strategy } from '../types/Strategy';

/**
 * Allocates `numVotes` votes to addresses
 */
export const fixedVotes = (numVotes: number, addresses: string[]): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const valid = addresses.find(a => a.toLowerCase() == userAddress.toLowerCase());
    return valid ? numVotes : 0;
  };
};
