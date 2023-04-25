import { BigNumber } from '@ethersproject/bignumber';
import { hash } from 'starknet';
import { ChainBase } from '../../../chain-base';
import { VotingConfig } from '../../../types';

export abstract class StrategyHandlerBase<CS> extends ChainBase {
  /**
   * The voting strategy type
   */
  public abstract get type(): string;

  /**
   * The voting strategy address
   */
  public abstract get address(): string;

  /**
   * Get the strategy address and params for the provided strategy ID
   * @param strategyId The strategy ID
   */
  protected async getStrategyAddressAndParams(strategyId: string) {
    // [strategy_addr, strategy_params_len, ...strategy_params]
    const { result } = await this._starknet.callContract({
      contractAddress: this._addresses.starknet.votingRegistry,
      entrypoint: 'get_voting_strategy',
      calldata: [strategyId],
    });
    return { addr: result[0], params: result.slice(2) };
  }

  /**
   * Get the voting strategy params that will be shared amongst all users
   * @param config The simplified voting strategy config
   */
  public abstract getStrategyParams(config: CS): Promise<string[]>;

  public abstract getUserParams(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<string[]>;

  /**
   * Get the voting power for a single voter
   * @param config Information required to fetch voting power for a user
   */
  public abstract getVotingPower(config: VotingConfig): Promise<BigNumber>;
}
