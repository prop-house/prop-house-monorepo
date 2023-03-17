import { ChainConfig, CommunityHouseConfig, HouseType } from '../../types';
import { defaultAbiCoder } from '@ethersproject/abi';
import { HouseBase } from './base';
import { CommunityHouse__factory } from '@prophouse/contracts';

export class CommunityHouse extends HouseBase<HouseType.COMMUNITY> {
  /**
   * Returns a `CommunityHouse` instance for the provided chain configuration
   * @param chainId
   */
  public static for(config: ChainConfig) {
    return new CommunityHouse(config);
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
    return this._addresses.evm.house.community;
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

  /**
   * Given a house address, return a `CommunityHouse` contract instance
   * @param address The house address
   */
  public getContract(address: string) {
    return CommunityHouse__factory.connect(address, this._evm);
  }
}
