import { Custom, RoundInfo, RoundType, RoundChainConfig } from '../types';
import { RoundBase, TimedFundingRound } from './implementations';

export class Round<CS extends void | Custom = void> {
  private readonly _timedFunding: TimedFundingRound<CS>;
  private readonly _all: Map<RoundType, RoundBase<RoundType, CS>>;

  constructor(config: RoundChainConfig<CS>) {
    this._timedFunding = TimedFundingRound.for<CS>(config);
    this._all = new Map([[this._timedFunding.type, this._timedFunding]]);
  }

  /**
   * Returns a `Round` instance for the provided chain ID
   * @param config The chain config
   */
  public static for<CS extends void | Custom = void>(config: RoundChainConfig<CS>) {
    return new Round(config);
  }

  /**
   * Timed funding round utilities
   */
  public get timedFunding() {
    return this._timedFunding;
  }

  /**
   * Get a round utility class instance
   * @param type The round type
   */
  public get(type: RoundType) {
    if (!this._all.has(type)) {
      throw new Error(`Unknown round type: ${type}`);
    }
    return this._all.get(type)!;
  }

  /**
   * @notice Get a round contract instance
   * @param type The round type
   * @param address The round address
   */
  public getContract(type: RoundType, address: string) {
    return this.get(type).getContract(address);
  }

  /**
   * @notice Returns the implementation contract address for the provided round type
   * @param type The round type
   */
  public getImplAddressForType(type: RoundType) {
    return this.get(type).impl;
  }

  /**
   * @notice ABI-encode the provided round configuration
   * @param round The round information
   */
  public async getABIEncodedConfig<RT extends RoundType>(round: RoundInfo<RT, CS>) {
    return this.get(round.roundType).getABIEncodedConfig(round.config);
  }
}
