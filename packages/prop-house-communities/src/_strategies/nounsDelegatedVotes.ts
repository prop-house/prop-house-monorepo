import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';
import NounsABI from '../abi/NounsABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';

export interface nounsDelegatedVotesStratArgs extends BaseArgs {
  multiplier: number;
  blockTag?: number;
}

/**
 * Calculates number of delegate votes for NounsDAO
 */
export const nounsDelegatedVotes: StrategyFactory<nounsDelegatedVotesStratArgs> = (
  params: nounsDelegatedVotesStratArgs,
): _Strategy => {
  return async () => {
    const { account, blockTag, provider, multiplier } = params;
    const _contract = new Contract(
      '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
      NounsABI,
      provider,
    );
    const balance = await _contract.getCurrentVotes(account, {
      blockTag: parseBlockTag(blockTag),
    });

    const parsedBal = new BigNumber(balance.toString()).toNumber();

    return parsedBal * multiplier;
  };
};
