import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { isActiveCommunity } from './isActiveCommunity';
import { getActiveCommunity } from './getCommunity';

export const getBalanceOfActiveCommunity = async (
  address: string,
  provider: Provider
): Promise<number> => {
  if (ethers.utils.isAddress(address)) throw new Error('Address is not valid');
  if (!isActiveCommunity(address))
    throw new Error('Address does not match to an active community.');

  const community = getActiveCommunity(address);
  if (!community) throw new Error('Community not found');

  const contract = new ethers.Contract(
    community.address,
    community.abi,
    provider
  );
  return await contract.balanceOf(address);
};
