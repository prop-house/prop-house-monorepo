import { contracts } from '../communities/contracts';

/**
 * Checks if contract address exists within the contracts array that holds contract that need
 * alt approaches to fetching votes
 */
export const hasAltNumVotes = (contractAddress: string) =>
  contracts.some(
    (c) => c.address.toLocaleLowerCase() === contractAddress.toLocaleLowerCase()
  );
