// import { ContractAddressProps, UserAddressProps } from '../WhoCanParticipate';

import { AddressProps } from '../WhoCanParticipate';

/**
 * Change properties of address by ID
 * @param id ID of address to update
 * @param addresses Array of addresses
 * @param changes Object with properties to change
 * @returns Updated array of addresses
 */
export const changeAddress = (
  id: string,
  addresses: AddressProps[],
  changes: Partial<AddressProps>,
) => addresses.map(address => (address.id === id ? { ...address, ...changes } : address));
