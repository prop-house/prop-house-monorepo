import {
  StoredAuction,
  StoredProposal,
} from "@nouns/prop-house-wrapper/dist/builders";

/**
 * Extract all proposals from stored auction data
 * @param auctions Set of auctions
 * @returns All proposals stored in state
 */
const extractAllProposals = (auctions: StoredAuction[]): StoredProposal[] =>
  auctions.reduce((acc, auction) => {
    acc = [...acc, ...auction.proposals];
    return acc;
  }, [] as StoredProposal[]);

export default extractAllProposals;
