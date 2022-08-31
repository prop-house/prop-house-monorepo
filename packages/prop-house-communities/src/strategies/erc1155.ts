import { Strategy } from '../types/Strategy';
import { ethers } from 'ethers';
import BalanceOf1155ABI from '../abi/BalanceOf1155ABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';

/**
 * Calculates `balanceOf` for specific token id within 1155 contract
 */
export const erc1155 = (
  communityAddress: string,
  tokenId: number,
  multiplier: number,
): Strategy => {
  return {
    address: communityAddress,
    numVotes: async (
      userAddress: string,
      provider,
      commmunityAddress,
      blockTag: string = 'latest',
    ) => {
      const contract = new ethers.Contract(communityAddress, BalanceOf1155ABI, provider);
      try {
        const votes = await contract.balanceOf(userAddress, tokenId, {
          blockTag: parseBlockTag(blockTag),
        });
        return ethers.BigNumber.from(votes).toNumber();
      } catch (e) {
        return 0;
      }
    },
    multiplier,
  };
};
