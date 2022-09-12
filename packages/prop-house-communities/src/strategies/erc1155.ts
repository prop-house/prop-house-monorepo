import { Strategy } from '../types/Strategy';
import BalanceOf1155ABI from '../abi/BalanceOf1155ABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { Contract, BigNumber } from 'ethers';

/**
 * Calculates `balanceOf` for specific token id within 1155 contract
 */
export const erc1155 = (tokenId: number, multiplier: number): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    multiplier: number = 1,
    blockTag: string,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOf1155ABI, provider);
    try {
      const votes = await contract.balanceOf(userAddress, tokenId, {
        blockTag: parseBlockTag(blockTag),
      });
      const bal = BigNumber.from(votes).toNumber();
      return bal * multiplier;
    } catch (e) {
      return 0;
    }
  };
};
