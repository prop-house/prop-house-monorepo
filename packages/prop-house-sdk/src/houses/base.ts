import { getContractAddressesForChainOrThrow, HouseImpls } from '../addresses';
import { HouseConfig, HouseType } from '../types';

export abstract class HouseBase<HT extends HouseType> {
  protected readonly _impls: HouseImpls;

  constructor(protected readonly _chainId: number) {
    const { evm } = getContractAddressesForChainOrThrow(this._chainId);
    this._impls = evm.house;
  }

  /**
   * The house type
   */
  public abstract get type(): HT;

  /**
   * The house implementation contract address
   */
  public abstract get impl(): string;

  /**
   * ABI-encode the provided house configuration
   * @param config The house configuration
   */
  public abstract getABIEncodedConfig(config: HouseConfig[HT]): string;
}
