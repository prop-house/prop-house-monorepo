import { hash } from 'starknet';
import { ChainConfig, VotingStrategyType, Whitelist, WhitelistMember } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { merkle, splitUint256 } from '../../utils';
import { StrategyHandlerBase } from './base';

export class WhitelistHandler extends StrategyHandlerBase<Whitelist> {
  /**
   * Returns a `WhitelistHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new WhitelistHandler(config);
  }

  /**
   * The voting strategy type
   */
  public get type() {
    return VotingStrategyType.WHITELIST;
  }

  /**
   * The voting strategy address
   */
  public get address() {
    return this._addresses.starknet.voting.whitelist;
  }

  /**
   * @notice Get the voting strategy params that will be shared amongst all users
   * @param strategy The voting strategy information
   */
  public async getStrategyParams(strategy: Whitelist): Promise<string[]> {
    if (!strategy.members?.length) {
      throw new Error('No whitelist members provided');
    }
    return [this.generateMerkleTree(strategy.members).root];
  }

  /**
   * @notice Get the user voting strategy params
   * For the merkle whitelist strategy, this is the address, voting power, and proof.
   */
  public async getUserParams(): Promise<string[]> {
    throw new Error('Not implemented');
  }

  /**
   * @notice Get the voting power for the provided user, obtained from the whitelist
   */
  public async getVotingPower(): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  /**
   * Generate a merkle tree using the provided whitelist members
   * @param members The whitelist addresses and voting power amounts
   */
  private generateMerkleTree(members: WhitelistMember[]) {
    const data = members
      .map(member => {
        const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.votingPower));
        return [hash.computeHashOnElements([member.address, low, high]), member.address, low];
      })
      .sort((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      })
      .map((x, i) => [x[0], x[1], x[2], i]);
    return new merkle.MerklePedersen(data.map(x => x[0].toString()));
  }
}
