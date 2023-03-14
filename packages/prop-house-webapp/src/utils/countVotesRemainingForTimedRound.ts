import { StoredVote } from '@nouns/prop-house-wrapper/dist/builders';
import { VoteAllotment } from '../types/VoteAllotment';
import { countNumVotes } from './countNumVotes';
import { countTotalVotesAlloted } from './countTotalVotesAlloted';

/**
 * Vote remaining to be alloted after substracting already casted and alloted votes.
 */
export const countVotesRemainingForTimedRound = (
  votingPower: number,
  votesAlreadyCasted: StoredVote[],
  voteAllotments: VoteAllotment[],
): number =>
  votingPower - countNumVotes(votesAlreadyCasted) - countTotalVotesAlloted(voteAllotments);
