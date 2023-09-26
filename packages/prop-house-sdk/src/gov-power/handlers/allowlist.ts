import { hash } from 'starknet';
import { ChainConfig, GovPowerStrategyType, AllowlistConfig, AllowlistMember } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { merkle, splitUint256 } from '../../utils';
import { StrategyHandlerBase } from './base';

export class AllowlistHandler extends StrategyHandlerBase<AllowlistConfig> {
  /**
   * Returns a `AllowlistHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new AllowlistHandler(config);
  }

  /**
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.ALLOWLIST;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.allowlist;
  }

  /**
   * @notice Get the governance power strategy params that will be shared amongst all users
   * @param strategy The  governance power strategy information
   */
  public async getStrategyParams(strategy: AllowlistConfig): Promise<string[]> {
    if (!strategy.members?.length) {
      throw new Error('No allowlist members provided');
    }
    return [this.generateMerkleTree(strategy.members).root];
  }

  /**
   * @notice Get the user governance power strategy params
   * For the merkle allowlist strategy, this is the address, governance power, and proof.
   */
  public async getUserParams(): Promise<string[]> {
    throw new Error('Not implemented');
  }

  /**
   * @notice Get the governance power for the provided user, obtained from the allowlist
   */
  public async getPower(): Promise<BigNumber> {
    throw new Error('Not implemented');
  }

  /**
   * Generate a merkle tree using the provided allowlist members
   * @param members The allowlist addresses and governance power amounts
   */
  private generateMerkleTree(members: AllowlistMember[]) {
    const data = members
      .map(member => {
        const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.govPower));
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
