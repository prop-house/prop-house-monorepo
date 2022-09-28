from starkware.cairo.common.uint256 import Uint256

from src.starknet.common.lib.general_address import Address

struct ProposalInfo:
    member proposal_id : felt
    member proposer_address : Address
    member voting_power : Uint256
end
