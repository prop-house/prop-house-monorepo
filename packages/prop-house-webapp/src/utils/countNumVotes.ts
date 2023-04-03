import { SignatureState, StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Counts total number of validated `vote.weight` from `votes`
 */
export const countNumVotes = (votes: StoredVote[]) =>
  votes
    .filter(v => v.signatureState === SignatureState.VALIDATED)
    .reduce((prev, current) => prev + Number(current.weight), 0);
