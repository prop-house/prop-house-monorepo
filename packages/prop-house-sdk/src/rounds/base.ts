import { getContractAddressesForChainOrThrow, RoundImpls } from '../addresses';
import { RoundConfig, RoundType } from '../types';

export abstract class RoundBase<RT extends RoundType> {
  protected readonly _impls: RoundImpls;

  constructor(protected readonly _chainId: number) {
    const { evm } = getContractAddressesForChainOrThrow(this._chainId);
    this._impls = evm.round;
  }

  /**
   * The round type
   */
  public abstract get type(): RT;

  /**
   * The round implementation contract address
   */
  public abstract get impl(): string;

  /**
   * ABI-encode the provided round configuration
   * @param config The round configuration
   */
  public abstract getABIEncodedConfig(config: RoundConfig[RT]): Promise<string>;
}
