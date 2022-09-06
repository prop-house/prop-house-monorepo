import { BaseStrategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract, BigNumber } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';

/**
 * Calculates `balanceOf` for contract
 */
export const balanceOf = (): BaseStrategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    multiplier: number = 1,
    blockTag: string,
    provider?: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOfABI, provider);
    try {
      const bal = BigNumber.from(
        await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
      ).toNumber();
      return bal * multiplier;
    } catch (e) {
      throw new Error('Error using balanceOf strategy');
    }
  };
};
