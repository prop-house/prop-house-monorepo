import { ContractAddresses } from '../addresses';
import { encodeFundingHouseConfig } from '../houses';
import { HouseType, House } from '../types';

/**
 * Returns the ABI-encoded configuration for the provided `house`
 * @param house The house information
 */
export const encodeConfig = <HT extends HouseType>(house: House<HT>) => {
  switch (house.houseType) {
    case HouseType.FUNDING:
      return encodeFundingHouseConfig(house.config);
    default:
      throw new Error(`Unknown house type: ${house.houseType}`);
  }
};

/**
 * Returns the address for the provided house type from `addresses`
 * @param houseType The house type
 * @param addresses The contract addresses
 */
export const addressForType = (houseType: HouseType, addresses: ContractAddresses) => {
  const houseTypes: Record<HouseType, string> = {
    [HouseType.FUNDING]: addresses.evm.house.funding,
  };
  if (!houseTypes[houseType]) {
    throw new Error(`Unknown house type: ${houseType}`);
  }
  return houseTypes[houseType];
};
