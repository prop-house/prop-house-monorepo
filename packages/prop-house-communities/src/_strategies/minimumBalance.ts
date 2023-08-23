import { ethers } from 'ethers';
import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface minimumBalanceStratArgs extends BaseArgs {
  minEthBal: number;
}

/**
 * Checks for minimum ETH balance
 */
export const minimumBalance: StrategyFactory<minimumBalanceStratArgs> = (
  params: minimumBalanceStratArgs,
): _Strategy => {
  return async () => {
    const { account, provider, minEthBal } = params;

    const balance = await provider.getBalance(account);
    const balanceInEth = ethers.utils.formatEther(balance);
    if (parseFloat(balanceInEth) < minEthBal) return 0;

    return 1;
  };
};
