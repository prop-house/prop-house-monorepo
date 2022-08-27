from src.starknet.lib.general_address import Address

# TODO: This may be specific to strategy
# For timed funding rounds, maybe it's not worth it, but for
# 'small grants' there will be a requested amount.
struct Proposal:
    member proposer_address : felt
    # TODO: None of these make sense
    # member quorum : Uint256
    # member snapshot_timestamp : felt
    # member start_timestamp : felt
    # member min_end_timestamp : felt
    # member max_end_timestamp : felt
    # member executor : felt
    # member execution_hash : felt
end
