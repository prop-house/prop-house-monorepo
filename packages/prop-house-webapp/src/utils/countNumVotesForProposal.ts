import { StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Counts votes for a specific proposal.
 */
const numVotesForProposal = (
  votes: StoredVote[],
  proposalId: number
): number => {
  return votes.filter((vote) => vote.proposalId === proposalId).length;
};

export default numVotesForProposal;
