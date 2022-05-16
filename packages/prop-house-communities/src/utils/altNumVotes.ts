import { contracts } from '../communities/contracts';

/**
 * Gets community contract and calls its `numVotes` fn
 */
export const altNumVotes = async (
  userAddress: string,
  communityAddress: string
): Promise<number> => {
  const c = contracts.find((c) => c.address === communityAddress);
  if (!c) throw 'No contract found';
  return await c.numVotes(userAddress);
};
