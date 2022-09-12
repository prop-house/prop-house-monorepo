import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import NameABI from '../abi/NameABI.json';

/**
 * Gets `name` from contract (assuming it complies w the ERC721/ERC20 standard)
 */
export const getName = async (
  commnunityAddress: string,
  provider: Provider,
): Promise<string | undefined> => {
  if (!ethers.utils.isAddress(commnunityAddress)) throw new Error('Community address is not valid');

  const contract = new ethers.Contract(commnunityAddress, NameABI, provider);

  const name = await contract.name();
  if (!name) throw Error(`Error fetching name for contract ${commnunityAddress}`);
  return name;
};
