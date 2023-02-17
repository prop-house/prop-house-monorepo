import { VotingStrategyInfo, StarknetVotingStrategy } from '../types';

export abstract class VotingStrategyBase<VS extends VotingStrategyInfo> {
  /**
   * The voting strategy type
   */
  public abstract get type(): string;

  constructor(protected readonly _chainId: number) {}

  /**
   * Get the address and low-level parameter information for the provided voting strategy
   * @param strategy The voting strategy information
   */
  public abstract getStarknetStrategy(strategy: VS): Promise<StarknetVotingStrategy>;
}
