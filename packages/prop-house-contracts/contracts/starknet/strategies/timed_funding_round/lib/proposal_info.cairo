from starkware.cairo.common.uint256 import Uint256

from contracts.starknet.common.lib.general_address import Address

struct ProposalInfo {
    proposal_id: felt,
    proposer_address: Address,
    voting_power: Uint256,
}
