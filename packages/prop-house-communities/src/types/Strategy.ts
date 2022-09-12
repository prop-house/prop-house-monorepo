import { Provider } from '@ethersproject/providers';

export type Strategy = (
  userAddress: string,
  communityAddress: string,
  blockTag: string,
  provider: Provider,
) => Promise<number>;
