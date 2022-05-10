import { contracts } from '../communities/contracts';

export const getActiveCommunity = (address: string) =>
  contracts.find((c) => c.address.toLowerCase() === address.toLowerCase());
