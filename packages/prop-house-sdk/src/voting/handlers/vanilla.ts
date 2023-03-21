import { ChainConfig, Vanilla, VotingStrategyType } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { StrategyHandlerBase } from './base';

export class VanillaHandler extends StrategyHandlerBase<Vanilla> {
  /**
   * Returns a `VanillaHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new VanillaHandler(config);
  }

  /**
   * The voting strategy type
   */
  public get type() {
    return VotingStrategyType.VANILLA;
  }

  /**
   * The voting strategy address
   */
  public get address() {
    return this._addresses.starknet.voting.vanilla;
  }

  /**
   * @notice Get the voting strategy params that will be shared amongst all users
   * No params are required for the vanilla strategy.
   */
  public async getStrategyParams(): Promise<string[]> {
    return [];
  }

  /**
   * @notice Get the voting strategy params for a single user.
   * No params are required for the vanilla strategy.
   */
  public async getUserParams(): Promise<string[]> {
    return [];
  }

  /**
   * @notice Returns a voting power of `1` for all users.
   */
  public async getVotingPower(): Promise<BigNumber> {
    return BigNumber.from(1);
  }
}
