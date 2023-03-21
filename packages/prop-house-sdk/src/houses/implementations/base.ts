import { HouseConfig, HouseContract, HouseType } from '../../types';
import { ChainBase } from '../../chain-base';

export abstract class HouseBase<HT extends HouseType> extends ChainBase {
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
  public abstract getContract(address: string): HouseContract[HT];

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
