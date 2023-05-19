import { ChainConfig, Vanilla, GovPowerStrategyType } from '../../types';
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
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.VANILLA;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.vanilla;
  }

  /**
   * @notice Get the governance power strategy params that will be shared amongst all users
   * No params are required for the vanilla strategy.
   */
  public async getStrategyParams(): Promise<string[]> {
    return [];
  }

  /**
   * @notice Get the governance power strategy params for a single user.
   * No params are required for the vanilla strategy.
   */
  public async getUserParams(): Promise<string[]> {
    return [];
  }

  /**
   * @notice Returns a governance power of `1` for all users.
   */
  public async getPower(): Promise<BigNumber> {
    return BigNumber.from(1);
  }
}
