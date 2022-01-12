import { StoredProposal } from "@nouns/prop-house-wrapper/dist/builders";

export interface ProposalFields {
	title: string;
	who: string;
	what: string;
	links: string;
	timeline: string;
}

const proposalFields = (proposal: StoredProposal): ProposalFields => ({
	title: proposal.title,
	who: proposal.who,
	what: proposal.what,
	links: proposal.links,
	timeline: proposal.timeline
})

export default proposalFields
