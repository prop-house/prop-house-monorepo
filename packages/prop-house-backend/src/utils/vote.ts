import { Vote } from 'src/vote/vote.entity';

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

export interface IndividualVoteWeights {
  [VoteType.Nouner]: number;
  [VoteType.Nounish]: number;
}

/**
 * Accumulate voting power for vote types
 */
const ACC_VOTE_WEIGHTS = {
  [VoteType.Nouner]: 0.6,
  [VoteType.Nounish]: 0.4,
};

/**
 * Individual voting weight for vote types. Dependant on variable total votes.
 */
export const calcIndividualVoteWeight = (
  voteType: VoteType,
  votes: Vote[],
): number => {
  const votesForType = votes.filter((vote) => vote.type === voteType).length;
  if (votesForType === 0) return 0;
  return (votes.length * ACC_VOTE_WEIGHTS[voteType]) / votesForType;
};
