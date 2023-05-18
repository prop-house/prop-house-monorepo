import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';

/**
 * Test if the Proposal has been funded - vote count is greater
 * than or equal to quorum
 * @param quorum The minimum vote count a proposal must have
 * @returns True if proposal has passed quorum
 */
export const isProposalOverQuorum =
  (quorum: number) => (proposal: InfiniteAuctionProposal) =>
    proposal.voteCountFor >= quorum;

/**
 * Test if a proposal has/should be funded based on its vote
 * quorum. See also `isProposalOverQuorum`
 */
export const isProposalFunded = isProposalOverQuorum;

/**
 * Calculate the total amount of currency units that have been
 * requested in the provided proposals
 * @param proposals Proposals to accumulate over
 * @returns Sum of request amount
 */
export const sumAmountRequested = (proposals: InfiniteAuctionProposal[]) =>
  proposals.reduce((acc, p) => acc + Number(p.reqAmount), 0);
