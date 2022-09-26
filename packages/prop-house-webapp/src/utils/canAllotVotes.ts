import { VoteAllotment } from '../types/VoteAllotment';
import { votesRemaining } from './votesRemaining';
/**
 * Votes remaining to be alloted are gt 0
 */
export const canAllotVotes = (
  votingPower: number,
  votesAlreadyCasted: number,
  voteAllotments: VoteAllotment[],
): boolean => votesRemaining(votingPower, votesAlreadyCasted, voteAllotments) > 0;
