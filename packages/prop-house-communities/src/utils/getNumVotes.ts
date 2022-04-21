import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { isActiveCommunity } from './isActiveCommunity';
import { getActiveCommunity } from './getCommunity';

/**
 * Gets balance of `userAddress`-owned NFTs in the `communityAddress` contract
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
  if (!isActiveCommunity(commmunityAddress))
    throw new Error('Community address does not match to an active community.');

  const community = getActiveCommunity(commmunityAddress);
  if (!community) throw new Error('Community not found');

  const contract = new ethers.Contract(
    community.address,
    community.abi,
    provider
  );
  return ethers.BigNumber.from(
    await contract.balanceOf(userAddress)
  ).toNumber();
};
