from starkware.cairo.common.uint256 import Uint256

struct ProposalVote:
    member proposal_id : felt
    member voting_power : Uint256
end
