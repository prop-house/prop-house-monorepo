import { VotingStrategyInfo, VotingStrategyStruct } from '../types';

export abstract class VotingStrategy<VS extends VotingStrategyInfo> {
  /**
   * The voting strategy type
   */
  public abstract get type(): string;

  constructor(protected readonly _chainId: number) {}

  /**
   * Convert the provided voting strategy to a low-level voting strategy struct
   * @param strategy The voting strategy information
   */
  public abstract getStructConfig(strategy: VS): Promise<VotingStrategyStruct>;
}
