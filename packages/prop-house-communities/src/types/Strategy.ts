import { Provider } from '@ethersproject/providers';

export type Strategy = (
  userAddress: string,
  communityAddress: string,
  blockTag: number,
  provider: Provider,
  roundId?: number,
) => Promise<number>;
