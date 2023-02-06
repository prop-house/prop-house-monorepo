from starkware.cairo.common.uint256 import Uint256

struct ProposalInfo {
    proposal_id: felt,
    proposer_address: felt,
    voting_power: Uint256,
}
