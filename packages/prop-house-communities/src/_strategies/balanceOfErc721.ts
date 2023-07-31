import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface balanceOfErc721StratArgs extends BaseArgs {
  contract: string;
  multiplier: number;
  blockTag: number;
  minBalanceReq?: {
    minBalance: number;
    fixedVotes: number;
  };
}

/**
 * Calculates `balanceOf` for ERC-721 contract
 */
export const balanceOfErc721: StrategyFactory<balanceOfErc721StratArgs> = (
  params: balanceOfErc721StratArgs,
): _Strategy => {
  return async () => {
    const { account, contract, blockTag, provider, multiplier, minBalanceReq } = params;
    const _contract = new Contract(contract, BalanceOfABI, provider);
    const balance = await _contract.balanceOf(account, {
      blockTag: parseBlockTag(blockTag),
    });

    const parsedBal = new BigNumber(balance.toString()).toNumber();

    if (minBalanceReq && parsedBal >= minBalanceReq.minBalance)
      return minBalanceReq.fixedVotes ? minBalanceReq.fixedVotes : parsedBal * multiplier;

    return parsedBal * multiplier;
  };
};
