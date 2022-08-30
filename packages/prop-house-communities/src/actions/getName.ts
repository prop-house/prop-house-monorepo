import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import NameABI from '../abi/NameABI.json';

/**
 * Gets `name` from contract (assuming it complies w the ERC721/ERC20 standard)
 */
export const getName = async (commmunityAddress: string, provider: Provider): Promise<string> => {
  if (!ethers.utils.isAddress(commmunityAddress)) throw new Error('Community address is not valid');

  const contract = new ethers.Contract(commmunityAddress, NameABI, provider);

  try {
    return await contract.name();
  } catch (e) {
    throw e;
  }
};
