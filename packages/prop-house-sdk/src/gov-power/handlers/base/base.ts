import { BigNumber } from '@ethersproject/bignumber';
import { Call } from 'starknet';
import { ChainBase } from '../../../chain-base';
import { GovPowerConfig } from '../../../types';

export abstract class StrategyHandlerBase<CS> extends ChainBase {
  /**
   * The governance power strategy type
   */
  public abstract get type(): string;

  /**
   * The governance power strategy address
   */
  public abstract get address(): string;

  /**
   * Get the strategy address and params for the provided strategy ID
   * @param strategyId The strategy ID
   */
  protected async getStrategyAddressAndParams(strategyId: string) {
    // [strategy_addr, strategy_params_len, ...strategy_params]
    const { result } = await this._starknet.callContract({
      contractAddress: this._addresses.starknet.strategyRegistry,
      entrypoint: 'get_strategy',
      calldata: [strategyId],
    });
    return { addr: result[0], params: result.slice(2) };
  }

  /**
   * Get the governance power strategy params that will be shared amongst all users
   * @param config The simplified governance power strategy config
   */
  public abstract getStrategyParams(config: CS): Promise<string[]>;

  public abstract getUserParams(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<string[]>;

  /**
   * Get the governance power for a single user
   * @param config Information required to fetch governance power for a user
   */
  public abstract getPower(config: GovPowerConfig): Promise<BigNumber>;

  public getStrategyPreCalls?(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<Call[]>;
}
