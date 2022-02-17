import { StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Counts votes for a specific proposal.
 */
const countNumVotesForProposal = (
  votes: StoredVote[],
  proposalId: number
): number => {
  return votes.filter((vote) => vote.proposalId === proposalId).length;
};

export default countNumVotesForProposal;
