export enum VoteDirections {
  Up = 1,
  Down = -1,
  Abstain = 0,
}

export const isValidVoteDirection = (dir) =>
  dir === VoteDirections.Up ||
  dir === VoteDirections.Down ||
  dir === VoteDirections.Abstain;

export enum VoteType {
  Nouner,
  Nounish,
}

export interface DelegatedVotes {
  votes: number;
  type: VoteType;
}
