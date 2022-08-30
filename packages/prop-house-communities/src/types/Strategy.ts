import { Provider } from '@ethersproject/providers';

/**
 * Voting strategy for communities that require custom approaches to counting votes.
 */
export interface Strategy {
  /** contract address for which the voting strategy is being used for */
  address: string;
  /** vote strategy  */
  numVotes: (
    userAddress: string,
    provider: Provider,
    commmunityAddress: string,
    blockTag: string,
  ) => Promise<number>;
  /** multiplier of votes. number to be used against default number of votes (e.g. make each nft count as 10 votes instead of 1) */
  multiplier?: number;
}
