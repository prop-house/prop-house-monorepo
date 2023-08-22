import ThriveCoinVoterList from '../abi/ThriveCoinVoterList.json';
import { Contract } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';
import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface thankApeStratArgs extends BaseArgs {
  address: string;
  fixedVotes?: number;
  blockTag?: number;
}

export const thankApe: StrategyFactory<thankApeStratArgs> = (
  params: thankApeStratArgs,
): _Strategy => {
  return async () => {
    const { account, address, blockTag, provider, fixedVotes } = params;

    const contract = new Contract(address, ThriveCoinVoterList, provider);
    const hasVoteRight = await contract.hasVoteRight(account, {
      blockTag: parseBlockTag(blockTag),
    });

    return !hasVoteRight ? 0 : fixedVotes ? fixedVotes : 1;
  };
};
