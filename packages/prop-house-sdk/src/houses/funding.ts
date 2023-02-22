import { FundingHouseConfig, HouseType } from '../types';
import { defaultAbiCoder } from '@ethersproject/abi';
import { HouseBase } from './base';

export class FundingHouse extends HouseBase<HouseType.FUNDING> {
  /**
   * Returns a `FundingHouse` instance for the provided chain ID
   * @param chainId
   */
  public static for(chainId: number) {
    return new FundingHouse(chainId);
  }

  /**
   * The house type
   */
  public get type() {
    return HouseType.FUNDING;
  }

  /**
   * The house implementation contract address
   */
  public get impl() {
    return this._impls.funding;
  }

  /**
   * ABI-encode the funding house configuration
   * @param config The funding house config
   */
  public getABIEncodedConfig(config: FundingHouseConfig): string {
    if (!this.isValidURI(config.contractURI)) {
      throw new Error(`Invalid contract URI: ${config.contractURI}`);
    }
    return defaultAbiCoder.encode(['string'], [config.contractURI]);
  }

  /**
   * Determine if the passed `uri` is valid
   * @param uri The URI
   */
  private isValidURI(uri: string) {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }
}
