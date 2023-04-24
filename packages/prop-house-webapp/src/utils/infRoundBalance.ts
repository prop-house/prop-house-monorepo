import { Proposal, Round } from '@prophouse/sdk-react';
import getWinningIds from './getWinningIds';

/**
 * Caluclates remaining balance of infinite round (fundingAmount - winnerProposals.fundReq)
 */
export const infRoundBalance = (
  proposals: Proposal[],
  round: Round,
): number => {
  const winners = getWinningIds(proposals, round);
  return 0; // TODO: Not Implemented
  // return (
  //   round.fundingAmount -
  //   proposals.reduce((prev, prop) => {
  //     const won = winners.includes(prop.id);
  //     const reqAmount = Number(prop.reqAmount);
  //     return !won && reqAmount !== null ? prev : prev + reqAmount;
  //   }, 0)
  // );
};
