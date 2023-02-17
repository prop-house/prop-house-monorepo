import { RoundInfo, RoundType } from '../types';
import { RoundBase } from './base';
import { TimedFundingRound } from './timed-funding';

export class Round {
  private readonly _rounds: Map<RoundType, RoundBase<RoundType>>;

  constructor(chainId: number) {
    this._rounds = new Map([[RoundType.TIMED_FUNDING, TimedFundingRound.for(chainId)]]);
  }

  /**
   * Returns a `Round` instance for the provided chain ID
   * @param chainId
   */
  public static for(chainId: number) {
    return new Round(chainId);
  }

  /**
   * Round helpers
   */
  public get rounds() {
    return this._rounds;
  }

  /**
   * @notice Get the round helper for the provided round type
   * @param roundType The round type
   */
  public getRound(roundType: RoundType) {
    if (!this.rounds.has(roundType)) {
      throw new Error(`Unknown round type: ${roundType}`);
    }
    return this.rounds.get(roundType)!;
  }

  /**
   * @notice Returns the implementation contract address for the provided round type
   * @param roundType The round type
   */
  public getImplForType(roundType: RoundType) {
    return this.getRound(roundType).impl;
  }

  /**
   * @notice ABI-encode the provided round configuration
   * @param round The round information
   */
  public async getABIEncodedConfig<RT extends RoundType>(round: RoundInfo<RT>) {
    return this.getRound(round.roundType).getABIEncodedConfig(round.config);
  }
}
