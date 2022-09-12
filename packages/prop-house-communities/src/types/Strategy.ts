import { Provider } from '@ethersproject/providers';

export type Strategy = (
  userAddress: string,
  communityAddress: string,
  multiplier: number,
  blockTag: string,
  provider: Provider,
) => Promise<number>;
