import { StoredVote } from '@nouns/prop-house-wrapper/dist/builders';
import { VoteAllotment } from '../types/VoteAllotment';
import { countNumVotesForProp } from './countNumVotesForProp';
import { countVotesAllottedToProp } from './countVotesAllottedToProp';
import { Vote } from '@prophouse/sdk-react';

/**
 * Vote remaining to be alloted after substracting already casted and alloted votes.
 */
export const countVotesRemainingForInfRound = (
  proposalId: number,
  votingPower: number,
  votesAlreadyCasted: Vote[],
  voteAllotments: VoteAllotment[],
): number =>
  votingPower -
  countNumVotesForProp(votesAlreadyCasted, proposalId) -
  countVotesAllottedToProp(voteAllotments, proposalId);
