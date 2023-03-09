import { ChainConfig, HouseInfo, HouseType } from '../types';
import { HouseBase, CommunityHouse } from './implementations';

export class House {
  private readonly _houses: Map<HouseType, HouseBase<HouseType>>;

  constructor(config: ChainConfig) {
    this._houses = new Map([[HouseType.COMMUNITY, CommunityHouse.for(config)]]);
  }

  /**
   * Returns a `House` instance for the provided chain ID
   * @param config The chain configuration
   */
  public static for(config: ChainConfig) {
    return new House(config);
  }

  /**
   * Map of house helper class instances
   */
  public get houses() {
    return this._houses;
  }

  /**
   * @notice Get a house contract instance
   * @param houseType The house type
   * @param address The house address
   */
  public getContractInstance(houseType: HouseType, address: string) {
    return this.getHouseHelper(houseType).getContractInstance(address);
  }

  /**
   * @notice Returns the implementation contract address for the provided house type
   * @param houseType The house type
   */
  public getImplAddressForType(houseType: HouseType) {
    return this.getHouseHelper(houseType).impl;
  }

  /**
   * @notice ABI-encode the provided house configuration
   * @param house The house information
   */
  public getABIEncodedConfig<HT extends HouseType>(house: HouseInfo<HT>) {
    return this.getHouseHelper(house.houseType).getABIEncodedConfig(house.config);
  }

  /**
   * @notice Get the house helper for the provided house type
   * @param houseType The house type
   */
  private getHouseHelper(houseType: HouseType) {
    if (!this.houses.has(houseType)) {
      throw new Error(`Unknown house type: ${houseType}`);
    }
    return this.houses.get(houseType)!;
  }
}
