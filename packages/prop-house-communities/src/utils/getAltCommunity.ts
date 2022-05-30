import { contracts } from '../communities/contracts';

/**
 * Alt communities are communities that require an alternative method for fetching votes (i.e. not just `balanceOf`)
 */
export const getAltCommunity = (communityAddress: string) => {
  return contracts.find(
    (c) => c.address.toLowerCase() === communityAddress.toLowerCase()
  );
};
