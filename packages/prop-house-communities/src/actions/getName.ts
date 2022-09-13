import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import NameABI from '../abi/NameABI.json';

/**
 * Gets `name` from contract (assuming it complies w the ERC721/ERC20 standard)
 */
export const getName = async (
  communityAddress: string,
  provider: Provider,
): Promise<string | undefined> => {
  if (!ethers.utils.isAddress(communityAddress)) throw new Error('Community address is not valid');

  const contract = new ethers.Contract(communityAddress, NameABI, provider);

  const name = await contract.name();
  if (!name) throw Error(`Error fetching name for contract ${communityAddress}`);
  return name;
};
