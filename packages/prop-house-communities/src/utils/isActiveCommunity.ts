import { contracts } from '../communities/contracts';

export const isActiveCommunity = (address: string) =>
  contracts.some(
    (c) => c.address.toLocaleLowerCase() === address.toLocaleLowerCase()
  );
