import { StoredInfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Proposal } from '@prophouse/sdk-react';

/**
 * Caluclates remaining balance of infinite round (fundingAmount - winnerProposals.fundReq)
 */
export const infRoundBalance = (proposals: Proposal[], round: StoredInfiniteAuction): number => {
  const winners = proposals.filter(p => p.isWinner);
  return (
    round.fundingAmount -
    proposals.reduce((prev, prop) => {
      const won = winners.includes(prop);
      // const reqAmount = Number(prop.reqAmount); // todo: solve for reqamount
      const reqAmount = 1;
      return !won && reqAmount !== null ? prev : prev + reqAmount;
    }, 0)
  );
};
