import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface balanceOfErc721StratArgs extends BaseArgs {
  contract: string;
  multiplier: number;
  minBalanceReq?: {
    minBalance: number;
    fixedVotes: number;
  };
}

/**
 * Calculates `balanceOf` for ERC-721 contract
 */
export const balanceOfErc721 = (params: balanceOfErc721StratArgs): _Strategy => {
  return async () => {
    const { contract, blockTag, provider, multiplier, minBalanceReq } = params;
    const account = '0xe50f17cb7d86bd2cf3ee2334c7faee29bd124882';
    const _contract = new Contract(contract, BalanceOfABI, provider);
    const balance = await _contract.balanceOf(account, {
      blockTag: parseBlockTag(blockTag),
    });

    const parsedBal = new BigNumber(balance.toString()).toNumber();

    if (minBalanceReq && parsedBal > minBalanceReq.minBalance)
      return minBalanceReq.fixedVotes ? minBalanceReq.fixedVotes : parsedBal * multiplier;

    return parsedBal * multiplier;
  };
};
