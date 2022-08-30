import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { getStrategy } from './getStrategy';
import { parseBlockTag } from './parseBlockTag';

/**
 * Gets number of votes for an address given a communityAddress:
 * Checks if commnunity has an alternative approach to calculating votes,
 * if not, defaults to `balanceOf` call.
 * @param userAddress
 * @param commmunityAddress
 * @param provider
 * @returns
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
  const strategy = getStrategy(commmunityAddress);
  if (strategy) {
    const votes = await strategy.numVotes(userAddress, provider, commmunityAddress, blockTag);
    return strategy.multiplier ? votes * strategy.multiplier : votes;
  }

  // else, use `balanceOf`
  const contract = new ethers.Contract(commmunityAddress, BalanceOfABI, provider);
  return ethers.BigNumber.from(
    await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
  ).toNumber();
};
