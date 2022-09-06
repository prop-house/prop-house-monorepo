import { communities } from '../communities';

/**
 * Get strategy for community with address from /strategies dir
 */
export const strategyForCommunity = (communityAddress: string) => {
  const strat = Object.entries(communities).find(
    strat => strat[0].toLowerCase() === communityAddress.toLowerCase(),
  );
  return strat ? strat[1] : undefined;
};
