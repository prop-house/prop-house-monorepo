import { StoredProposalWithVotes } from "@nouns/prop-house-wrapper/dist/builders";
import firstOrNull from "./firstOrNull";

/**
 * Extract the address's current vote direction from a stored proposal, returns vote direction or undefined if the address hasn't voted
 * @param address Address to test
 * @param proposal Proposal to inspect
 * @returns Vote direction or undefined if address hasn't yet voted
 */
const accountVoteDirection = (address: string, proposal: StoredProposalWithVotes) => {
	const vote = firstOrNull(proposal.votes.filter(v => v.address === address));
	return vote?.direction
}

export default accountVoteDirection;
