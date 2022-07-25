import {
  StoredProposalWithVotes,
  StoredVote,
} from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Get all `StoredVote` by address from set of `StoredProposalWithVotes`
 */
const extractAllVotes = (
  proposals: StoredProposalWithVotes[],
  address: string
): StoredVote[] => {
  return proposals
    .map((proposal: any) => proposal.votes)
    .flat()
    .filter((vote: any) => {
      if (!vote) return false;
      return vote.address === address;
    });
};

export default extractAllVotes;
