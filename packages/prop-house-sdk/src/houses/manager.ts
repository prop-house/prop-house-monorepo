import { ChainConfig, HouseInfo, HouseType } from '../types';
import { HouseBase, CommunityHouse } from './implementations';

export class HouseManager {
  private readonly _community: CommunityHouse;
  private readonly _all: Map<HouseType, HouseBase<HouseType>>;

  constructor(config: ChainConfig) {
    this._community = CommunityHouse.for(config);
    this._all = new Map([[this._community.type, this._community]]);
  }

  /**
   * Returns a `House` instance for the provided chain configuration
   * @param config The chain configuration
   */
  public static for(config: ChainConfig) {
    return new HouseManager(config);
  }

  /**
   * Community house utilities
   */
  public get community() {
    return this._community;
  }

  /**
   * Get a house utility class instance
   * @param type The house type
   */
  public get(type: HouseType) {
    if (!this._all.has(type)) {
      throw new Error(`Unknown house type: ${type}`);
    }
    return this._all.get(type)!;
  }

  /**
   * @notice Get the implementation contract address for the provided house type
   * @param type The house type
   */
  public getImpl(type: HouseType) {
    return this.get(type).impl;
  }

  /**
   * @notice Get a house contract instance
   * @param type The house type
   * @param address The house address
   */
  public getContract(type: HouseType, address: string) {
    return this.get(type).getContract(address);
  }

  /**
   * @notice ABI-encode the provided house configuration
   * @param house The house information
   */
  public encode<HT extends HouseType>(house: HouseInfo<HT>) {
    return this.get(house.houseType).encode(house.config);
  }
}
