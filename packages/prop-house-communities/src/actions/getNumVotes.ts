import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { strategyForCommunity } from '../utils/strategyForCommunity';
import { balanceOf } from '../strategies/balanceOf';

/**
 * Gets number of votes for an address given a communityAddress:
 * Checks if commnunity has custom approach to calculating votes,
 * if not, defaults to `balanceOf` call.
 */
export const getNumVotes = async (
  userAddress: string,
  communityAddress: string,
  provider: Provider,
  blockTag: string = 'latest',
): Promise<number> => {
  if (!ethers.utils.isAddress(userAddress)) throw new Error('User address is not valid');
  if (!ethers.utils.isAddress(communityAddress)) throw new Error('Community address is not valid');

  // check if community has custom strategy for counting votes
  const strategy = strategyForCommunity(communityAddress);

  if (strategy) {
    return await strategy(userAddress, communityAddress, 1, blockTag, provider);
  }

  return await balanceOf()(userAddress, communityAddress, 1, blockTag, provider);
};
