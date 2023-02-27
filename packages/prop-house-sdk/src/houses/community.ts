import { CommunityHouseConfig, HouseType } from '../types';
import { defaultAbiCoder } from '@ethersproject/abi';
import { HouseBase } from './base';

export class CommunityHouse extends HouseBase<HouseType.COMMUNITY> {
  /**
   * Returns a `CommunityHouse` instance for the provided chain ID
   * @param chainId
   */
  public static for(chainId: number) {
    return new CommunityHouse(chainId);
  }

  /**
   * The house type
   */
  public get type() {
    return HouseType.COMMUNITY as const;
  }

  /**
   * The house implementation contract address
   */
  public get impl() {
    return this._impls.community;
  }

  /**
   * ABI-encode the community house configuration
   * @param config The community house config
   */
  public getABIEncodedConfig(config: CommunityHouseConfig): string {
    if (!this.isValidURI(config.contractURI)) {
      throw new Error(`Invalid contract URI: ${config.contractURI}`);
    }
    return defaultAbiCoder.encode(['string'], [config.contractURI]);
  }
}
