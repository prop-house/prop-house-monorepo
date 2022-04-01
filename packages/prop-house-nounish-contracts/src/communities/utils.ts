import contracts from './contracts';

export const isActiveCommunity = (address: string) =>
  contracts.some((c) => c.address === address);
