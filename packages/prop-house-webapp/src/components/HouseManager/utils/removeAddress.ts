import { AddressProps } from '../WhoCanParticipate';

/**
 * Remove address by ID
 * @param id ID of address to remove
 * @param addresses Array of addresses
 * @returns Updated array of addresses
 */
export const removeAddress = (id: string, addresses: AddressProps[]) =>
  addresses.filter(address => address.id !== id);
