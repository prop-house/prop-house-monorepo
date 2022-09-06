import { BaseStrategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract, BigNumber, utils } from 'ethers';
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
    const bal = BigNumber.from(
      await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
    );

    try {
      // attempt to parse BigNumber to number (eg 721)
      return bal.toNumber();
    } catch (e) {
      try {
        // attempt to parse via formatting decimals places (eg erc20)
        return Number(utils.formatEther(bal));
      } catch (e) {
        throw new Error(`Error using balanceOf strategy: ${e}`);
      }
    }
  };
};
