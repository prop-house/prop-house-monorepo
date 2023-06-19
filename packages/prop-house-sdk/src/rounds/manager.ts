import {
  Custom,
  RoundInfo,
  RoundType,
  RoundChainConfig,
  RoundConfigStruct,
  GetRoundStateParams,
  Newable,
} from '../types';
import { RoundBase, InfiniteRound, TimedRound } from './implementations';

export class RoundManager<CS extends void | Custom = void> {
  private static readonly _all = new Map([
    [RoundType.INFINITE, InfiniteRound],
    [RoundType.TIMED, TimedRound],
  ]);
  private readonly _infinite: InfiniteRound<CS>;
  private readonly _timed: TimedRound<CS>;
  private readonly _all: Map<RoundType, RoundBase<RoundType, CS>>;

  constructor(config: RoundChainConfig<CS>) {
    this._infinite = InfiniteRound.for<CS>(config);
    this._timed = TimedRound.for<CS>(config);
    this._all = new Map([
      [this._infinite.type, this._infinite],
      [this._timed.type, this._timed],
    ] as [RoundType, RoundBase<RoundType, CS>][]);
  }

  /**
   * Returns a `Round` instance for the provided chain ID
   * @param config The chain config
   */
  public static for<CS extends void | Custom = void>(config: RoundChainConfig<CS>) {
    return new RoundManager(config);
  }

  /**
   * Get the round state
   * @param type The round type
   * @param params The params required to get the round state
   */
  public static getState<RT extends RoundType>(type: RT | string, params: GetRoundStateParams<RT>) {
    return this.get(type as RT).getState(params as any); // TODO
  }

  /**
   * Infinite round utilities
   */
  public get infinite() {
    return this._infinite;
  }

  /**
   * Timed round utilities
   */
  public get timed() {
    return this._timed;
  }

  /**
   * Get a round utility class
   * @param type The round type
   */
  public static get(type: RoundType) {
    if (!this._all.has(type)) {
      throw new Error(`Unknown round type: ${type}`);
    }
    return this._all.get(type)!;
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
  public getImpl(type: RoundType) {
    return this.get(type).impl;
  }

  /**
   * Get the round state
   * @param type The round type
   * @param params The params required to get the round state
   */
  public getState<RT extends RoundType>(type: RT | string, params: GetRoundStateParams<RT>) {
    return RoundManager.getState<RT>(type, params);
  }

  /**
   * Convert the provided round configuration to a config struct
   * @param round The round information
   */
  public async getConfigStruct<RT extends RoundType>(round: RoundInfo<RT, CS>) {
    return this.get(round.roundType).getConfigStruct(round.config);
  }

  /**
   * Estimate the round registration message fee cost (in wei)
   * @param type The round type
   * @param configStruct The round configuration struct
   */
  public async estimateMessageFee<RT extends RoundType>(
    type: RoundType,
    configStruct: RoundConfigStruct[RT],
  ) {
    return this.get(type).estimateMessageFee(configStruct);
  }

  /**
   * ABI-encode the provided round configuration struct
   * @param type The round type
   * @param configStruct The round configuration struct
   */
  public encode<RT extends RoundType>(type: RT, configStruct: RoundConfigStruct[RT]) {
    return this.get(type).encode(configStruct);
  }
}
