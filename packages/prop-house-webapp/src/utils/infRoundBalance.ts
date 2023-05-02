import {
  StoredInfiniteAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import getWinningIds from './getWinningIds';

/**
 * Caluclates remaining balance of infinite round (fundingAmount - winnerProposals.fundReq)
 */
export const infRoundBalance = (
  proposals: StoredProposalWithVotes[],
  round: StoredInfiniteAuction,
): number => {
  const winners = getWinningIds(proposals, round);
  return (
    round.fundingAmount -
    proposals.reduce((prev, prop) => {
      const won = winners.includes(prop.id);
      const reqAmount = Number(prop.reqAmount);
      return !won && reqAmount !== null ? prev : prev + reqAmount;
    }, 0)
  );
};
