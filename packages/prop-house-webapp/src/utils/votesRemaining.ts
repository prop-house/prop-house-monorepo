import { VoteAllotment } from '../types/VoteAllotment';
import { countTotalVotesAlloted } from './countTotalVotesAlloted';

/**
 * Vote remaining to be alloted after substracting already casted and alloted votes.
 */
export const votesRemaining = (
  votingPower: number,
  votesAlreadyCasted: number,
  voteAllotments: VoteAllotment[],
): number => votingPower - votesAlreadyCasted - countTotalVotesAlloted(voteAllotments);
