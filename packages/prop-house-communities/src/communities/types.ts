export interface Contract {
  address: string;
  numVotes: (userAddress: string) => Promise<number>;
}
