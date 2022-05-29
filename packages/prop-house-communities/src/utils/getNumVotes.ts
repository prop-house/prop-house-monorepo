import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { getAltCommunity } from './getAltCommunity';

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
  provider: Provider
): Promise<number> => {
  if (!ethers.utils.isAddress(userAddress))
    throw new Error('User address is not valid');
  if (!ethers.utils.isAddress(commmunityAddress))
    throw new Error('Community address is not valid');

  // check if community has alt approach to fetching votes
  const altCommunity = getAltCommunity(commmunityAddress);
  if (altCommunity) {
    const votes = await altCommunity.numVotes(
      '0x2573c60a6d127755aa2dc85e342f7da2378a0cc5'
    );
    return altCommunity.multiplier ? votes * altCommunity.multiplier : votes;
  }

  // else, use `balanceOf`
  const contract = new ethers.Contract(
    commmunityAddress,
    BalanceOfABI,
    provider
  );
  return ethers.BigNumber.from(
    await contract.balanceOf(userAddress)
  ).toNumber();
};
