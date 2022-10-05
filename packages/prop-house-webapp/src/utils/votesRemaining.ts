import { VoteAllotment } from '../types/VoteAllotment';
import { voteWeightForAllottedVotes } from './voteWeightForAllottedVotes';

/**
 * Vote remaining to be alloted after substracting already casted and alloted votes.
 */
export const votesRemaining = (
  votingPower: number,
  votesAlreadyCasted: number,
  voteAllotments: VoteAllotment[],
): number => votingPower - votesAlreadyCasted - voteWeightForAllottedVotes(voteAllotments);
