import { getContractAddressesForChainOrThrow, HouseImpls } from '@prophouse/contracts';
import { ChainConfig, HouseConfig, HouseContract, HouseType } from '../../types';

export abstract class HouseBase<HT extends HouseType> {
  protected readonly _impls: HouseImpls;

  constructor(protected readonly _config: ChainConfig) {
    const { evm } = getContractAddressesForChainOrThrow(this._config.chainId);
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

  /**
   * Given a house address, return a house contract instance
   * @param address The house contract address
   */
  public abstract getContractInstance(address: string): HouseContract[HT];

  /**
   * Determine if the passed `uri` is valid
   * @param uri The URI
   */
  protected isValidURI(uri: string) {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }
}
