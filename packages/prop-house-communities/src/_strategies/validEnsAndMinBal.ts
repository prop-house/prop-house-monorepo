import { ethers } from 'ethers';
import { _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface validEnsAndMinBalStratArgs extends BaseArgs {
  minEthBal: number;
}

/**
 * Checks for valid ENS reverse resolution + minimum balance
 */
export const validEnsAndMinBal = (params: validEnsAndMinBalStratArgs): _Strategy => {
  return async () => {
    const { account, blockTag, provider, minEthBal } = params;

    const ens = await provider.lookupAddress(account);
    if (!ens) return 0;

    const balance = await provider.getBalance(account);
    const balanceInEth = ethers.utils.formatEther(balance);
    if (parseFloat(balanceInEth) < minEthBal) return 0;

    return 1;
  };
};
