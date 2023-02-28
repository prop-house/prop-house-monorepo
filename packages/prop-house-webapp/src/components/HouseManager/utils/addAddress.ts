import { uuid } from 'uuidv4';
import { AddressProps } from '../VotingStrategies';

/**
 * Add new address to array of addresses
 * @param addresses Array of addresses
 * @param initialAddress New address to add
 * @returns New array of addresses
 */
export const addAddress = (addresses: AddressProps[], initialAddress: AddressProps) => [
  ...addresses,
  { ...initialAddress, id: uuid() },
];
