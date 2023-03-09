import { ChainConfig, RoundInfo, RoundType } from '../types';
import { RoundBase, TimedFundingRound } from './implementations';

export class Round {
  private readonly _rounds: Map<RoundType, RoundBase<RoundType>>;

  constructor(config: ChainConfig) {
    this._rounds = new Map([[RoundType.TIMED_FUNDING, TimedFundingRound.for(config)]]);
  }

  /**
   * Returns a `Round` instance for the provided chain ID
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new Round(config);
  }

  /**
   * Round helpers
   */
  public get rounds() {
    return this._rounds;
  }

  /**
   * @notice Get a round contract instance
   * @param roundType The round type
   * @param address The round address
   */
  public getContractInstance(roundType: RoundType, address: string) {
    return this.getRoundHelper(roundType).getContractInstance(address);
  }

  /**
   * @notice Returns the implementation contract address for the provided round type
   * @param roundType The round type
   */
  public getImplAddressForType(roundType: RoundType) {
    return this.getRoundHelper(roundType).impl;
  }

  /**
   * @notice ABI-encode the provided round configuration
   * @param round The round information
   */
  public async getABIEncodedConfig<RT extends RoundType>(round: RoundInfo<RT>) {
    return this.getRoundHelper(round.roundType).getABIEncodedConfig(round.config);
  }

  /**
   * @notice Get the round helper for the provided round type
   * @param roundType The round type
   */
  private getRoundHelper(roundType: RoundType) {
    if (!this.rounds.has(roundType)) {
      throw new Error(`Unknown round type: ${roundType}`);
    }
    return this.rounds.get(roundType)!;
  }
}
