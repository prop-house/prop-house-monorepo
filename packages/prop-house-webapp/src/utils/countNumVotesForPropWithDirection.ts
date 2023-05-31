import { Direction, SignatureState, StoredVote } from '@nouns/prop-house-wrapper/dist/builders';

export const countNumVotesForPropWithDirection = (
  votes: StoredVote[],
  proposalId: number,
  direction: Direction,
) =>
  votes
    .filter(
      v =>
        v.signatureState === SignatureState.VALIDATED &&
        v.proposalId === proposalId &&
        v.direction === direction,
    )
    .reduce((prev, current) => prev + Number(current.weight), 0);
