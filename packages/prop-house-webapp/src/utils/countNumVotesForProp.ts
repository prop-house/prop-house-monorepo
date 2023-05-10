import { SignatureState, StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Counts total number of validated `vote.weight` from `votes` for proposal
 */
export const countNumVotesForProp = (votes: StoredVote[], proposalId: number) =>
  votes
    .filter(v => v.signatureState === SignatureState.VALIDATED && v.proposalId === proposalId)
    .reduce((prev, current) => prev + Number(current.weight), 0);
