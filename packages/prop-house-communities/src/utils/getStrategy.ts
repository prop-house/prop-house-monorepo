import { strategies } from '../strategies';

/**
 * Get strategy for community with address
 */
export const getStrategy = (communityAddress: string) => {
  const strat = Object.entries(strategies).find(
    strat => strat[1].address.toLowerCase() === communityAddress.toLowerCase(),
  );
  return strat ? strat[1] : undefined;
};
