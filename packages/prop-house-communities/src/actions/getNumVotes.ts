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
  commmunityAddress: string,
  provider: Provider,
  blockTag: string = 'latest',
): Promise<number> => {
  if (!ethers.utils.isAddress(userAddress)) throw new Error('User address is not valid');
  if (!ethers.utils.isAddress(commmunityAddress)) throw new Error('Community address is not valid');

  // check if community has custom strategy for counting votes
  const strategy = strategyForCommunity(commmunityAddress);
  if (strategy) {
    const votes = await strategy.numVotes(userAddress, provider, commmunityAddress, blockTag);
    return strategy.multiplier ? votes * strategy.multiplier : votes;
  }

  return balanceOf(commmunityAddress).numVotes(userAddress, provider, commmunityAddress, blockTag);
};
