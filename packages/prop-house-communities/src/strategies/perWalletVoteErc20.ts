import { Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Strategy } from '../types/Strategy';
import { balanceOfErc20 } from './balanceOfErc20';

/**
 * Gives a pre-specified number of `votes` to any wallet that has >= `threshold` amount of specified ERC20 token
 */
export const perWalletVoteErc20 = (
  decimals: number,
  votes: number = 1,
  threshold: number = 1,
): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const tokenBalance = await balanceOfErc20(decimals)(
      userAddress,
      communityAddress,
      blockTag,
      provider,
    );
    return tokenBalance > threshold ? votes : 0;
  };
};
