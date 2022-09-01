import { Strategy } from '../types/Strategy';
import { ethers } from 'ethers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';

/**
 * Calculates `balanceOf` for contract
 */
export const balanceOf = (communityAddress: string, multiplier: number = 1): Strategy => {
  return {
    address: communityAddress,
    numVotes: async (
      userAddress: string,
      provider,
      commmunityAddress,
      blockTag: string = 'latest',
    ) => {
      const contract = new ethers.Contract(commmunityAddress, BalanceOfABI, provider);
      try {
        return ethers.BigNumber.from(
          await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
        ).toNumber();
      } catch (e) {
        throw new Error('Error using balanceOf strategy');
      }
    },
    multiplier,
  };
};
