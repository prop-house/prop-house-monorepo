import { BigNumber } from '@ethersproject/bignumber';
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
