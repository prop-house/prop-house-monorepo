import { StoredProposalWithVotes, StoredVote } from '@nouns/prop-house-wrapper/dist/builders';
import extractAllVotes from './extractAllVotes';

/**
 * Calculates aggregate vote weight for votes extracted from a set of proposals
 */
export const aggVoteWeightForProps = (proposals: StoredProposalWithVotes[], address: string) =>
  extractAllVotes(proposals, address).reduce((agg, current) => agg + current.weight, 0);

/**
 * Calculates aggregate vote weight for a specific proposals from a set of votes
 */
export const aggVoteWeightForProp = (votes: StoredVote[], proposalId: number) =>
  votes
    .filter(v => v.proposalId === proposalId)
    .reduce((agg, current) => Number(agg) + Number(current.weight), 0);
