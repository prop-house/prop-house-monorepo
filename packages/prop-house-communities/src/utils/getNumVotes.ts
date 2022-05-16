import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { hasAltNumVotes } from './hasAltNumVotes';
import { altNumVotes } from './altNumVotes';

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

  if (hasAltNumVotes(commmunityAddress))
    return altNumVotes(userAddress, commmunityAddress);

  const contract = new ethers.Contract(
    commmunityAddress,
    BalanceOfABI,
    provider
  );
  return ethers.BigNumber.from(
    await contract.balanceOf(userAddress)
  ).toNumber();
};
