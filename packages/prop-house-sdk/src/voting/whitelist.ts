import { hash } from 'starknet';
import { getContractAddressesForChainOrThrow } from '../addresses';
import { StarknetVotingStrategy, VotingStrategyType, Whitelist, WhitelistMember } from '../types';
import { merkle, splitUint256 } from '../utils';
import { VotingStrategyBase } from './base';

export class WhitelistVotingStrategy extends VotingStrategyBase<Whitelist> {
  /**
   * Returns a `WhitelistVotingStrategy` instance for the provided chain ID
   * @param chainId The chain ID
   */
  public static for(chainId: number) {
    return new WhitelistVotingStrategy(chainId);
  }

  /**
   * The voting strategy type
   */
  public get type() {
    return VotingStrategyType.WHITELIST;
  }

  /**
   * @notice Get the address and low-level parameter information for the provided whitelist voting strategy
   * @param strategy The voting strategy information
   */
  public async getStarknetStrategy(strategy: Whitelist): Promise<StarknetVotingStrategy> {
    const { starknet } = getContractAddressesForChainOrThrow(this._chainId);
    if (!strategy.members?.length) {
      throw new Error('No whitelist members provided');
    }
    return {
      addr: starknet.voting.whitelist,
      params: [this.generateMerkleTree(strategy.members).root],
    };
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
