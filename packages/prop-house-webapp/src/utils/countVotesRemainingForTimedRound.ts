import { VoteAllotment } from '../types/VoteAllotment';
import { countNumVotes } from './countNumVotes';
import { countTotalVotesAlloted } from './countTotalVotesAlloted';
import { Vote } from '@prophouse/sdk-react';

/**
 * Vote remaining to be alloted after substracting already casted and alloted votes.
 */
export const countVotesRemainingForTimedRound = (
  votingPower: number,
  votesAlreadyCasted: Vote[],
  voteAllotments: VoteAllotment[],
): number =>
  votingPower - countNumVotes(votesAlreadyCasted) - countTotalVotesAlloted(voteAllotments);
