import { HouseInfo, HouseType } from '../types';
import { HouseBase } from './base';
import { CommunityHouse } from './community';

export class House {
  private readonly _houses: Map<HouseType, HouseBase<HouseType>>;

  constructor(chainId: number) {
    this._houses = new Map([[HouseType.COMMUNITY, CommunityHouse.for(chainId)]]);
  }

  /**
   * Returns a `House` instance for the provided chain ID
   * @param chainId
   */
  public static for(chainId: number) {
    return new House(chainId);
  }

  /**
   * House helpers
   */
  public get houses() {
    return this._houses;
  }

  /**
   * @notice Get the house helper for the provided house type
   * @param houseType The house type
   */
  public getHouse(houseType: HouseType) {
    if (!this.houses.has(houseType)) {
      throw new Error(`Unknown house type: ${houseType}`);
    }
    return this.houses.get(houseType)!;
  }

  /**
   * @notice Returns the implementation contract address for the provided house type
   * @param houseType The house type
   */
  public getImplForType(houseType: HouseType) {
    return this.getHouse(houseType).impl;
  }

  /**
   * @notice ABI-encode the provided house configuration
   * @param house The house information
   */
  public getABIEncodedConfig<HT extends HouseType>(house: HouseInfo<HT>) {
    return this.getHouse(house.houseType).getABIEncodedConfig(house.config);
  }
}
