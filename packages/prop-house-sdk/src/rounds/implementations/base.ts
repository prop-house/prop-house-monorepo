import { getContractAddressesForChainOrThrow, RoundImpls } from '@prophouse/contracts';
import { ChainConfig, RoundConfig, RoundContract, RoundType } from '../../types';

export abstract class RoundBase<RT extends RoundType> {
  protected readonly _impls: RoundImpls;

  constructor(protected readonly _config: ChainConfig) {
    const { evm } = getContractAddressesForChainOrThrow(this._config.chainId);
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

  /**
   * Given a round address, return a round contract instance
   * @param address The round contract address
   */
  public abstract getContractInstance(address: string): RoundContract[RT];
}
