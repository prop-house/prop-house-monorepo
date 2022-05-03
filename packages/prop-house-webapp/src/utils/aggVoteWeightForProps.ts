import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import extractAllVotes from './extractAllVotes';

/**
 * Calculates aggregate vote weight for votes extracted from a set of proposals
 */
export const aggVoteWeightForProps = (
  proposals: StoredProposalWithVotes[],
  address: string
) =>
  extractAllVotes(proposals, address).reduce(
    (agg, current) => agg + current.weight,
    0
  );
