from starkware.cairo.common.uint256 import Uint256

struct ProposalVote {
    proposal_id: felt,
    voting_power: Uint256,
}
