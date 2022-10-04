import { communities } from '../communities';

/**
 * Get strategy for community with address from /strategies dir
 */
export const strategyForCommunity = (communityAddress: string) => {
  return communities.get(communityAddress);
};
