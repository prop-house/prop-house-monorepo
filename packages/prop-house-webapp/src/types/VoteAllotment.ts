import { Direction } from '@nouns/prop-house-wrapper/dist/builders';

export interface VoteAllotment {
  proposalTitle: string;
  proposalId: number;
  votes: number;
  direction: Direction;
}
