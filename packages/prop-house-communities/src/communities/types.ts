/**
 * Contract for communities that required alt approaches to counting votes (other than the default `balanceOf` call)
 */
export interface Contract {
  address: string;
  numVotes: (userAddress: string) => Promise<number>;
  /** [optional] multiplier of votes. number to be used against default number of votes (e.g. make each nft count as 10 votes instead of 1) */
  multiplier?: number;
}
