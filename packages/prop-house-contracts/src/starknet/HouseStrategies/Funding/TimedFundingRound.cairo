# SPDX-License-Identifier: GPL-3.0

%lang starknet

# Standard Library
from starkware.starknet.common.syscalls import get_caller_address, get_block_timestamp
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_lt, uint256_le, uint256_eq
from starkware.cairo.common.cairo_keccak.keccak import finalize_keccak
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import (
    assert_lt,
    assert_le,
    assert_nn,
    assert_nn_le,
    assert_not_zero,
)

# External Libraries
from openzeppelin.security.safemath.library import SafeUint256

# Interfaces
from src.starknet.Interfaces.IVotingStrategy import IVotingStrategy
from src.starknet.Interfaces.IExecutionStrategy import IExecutionStrategy

# Types
from src.starknet.lib.general_address import Address
from src.starknet.lib.proposal_info import ProposalInfo
from src.starknet.lib.proposal_vote import ProposalVote
from src.starknet.lib.round_state import RoundState

# Libraries
from src.starknet.lib.array_2d import Array2D, Immutable2DArray
from src.starknet.lib.merkle_tree import MerkleTree
from src.starknet.lib.proposal_utils import ProposalUtils
from src.starknet.lib.math_utils import MathUtils
from src.starknet.lib.felt_utils import FeltUtils

#
# Constants
#

const MAX_WINNERS = 256

const MAX_LOG_N_WINNERS = 8

#
# Storage
#

@storage_var
func round_state_store() -> (state : felt):
end

@storage_var
func proposal_period_start_timestamp_store() -> (timestamp : felt):
end

@storage_var
func proposal_period_end_timestamp_store() -> (timestamp : felt):
end

@storage_var
func vote_period_end_timestamp_store() -> (timestamp : felt):
end

@storage_var
func voting_power_multiplier_store() -> (multiplier : felt):
end

@storage_var
func winner_count_store() -> (count : felt):
end

@storage_var
func next_proposal_nonce_store() -> (nonce : felt):
end

@storage_var
func proposal_vote_power_store(proposal_id : felt) -> (power : Uint256):
end

@storage_var
func spent_voting_power_store(voter_address : Address) -> (power : Uint256):
end

@storage_var
func proposer_address_registry_store(proposal_id : felt) -> (proposer_address : Address):
end

@storage_var
func cancelled_proposals_store(proposal_id : felt) -> (cancelled : felt):
end

@storage_var
func authenticators_store(authenticator_address : felt) -> (is_valid : felt):
end

@storage_var
func voting_strategy_store() -> (strategy_address : felt):
end

@storage_var
func voting_strategy_params_store(param_index : felt) -> (voting_strategy_param : felt):
end

@storage_var
func executor_store() -> (executor_address : felt):
end

#
# Events
#

@event
func proposal_created(
    proposal_id : felt,
    proposer_address : Address,
    metadata_uri_len : felt,
    metadata_uri : felt*,
):
end

@event
func vote_created(proposal_id : felt, voter_address : Address, voting_power : Uint256):
end

#
# Constructor
#

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    house_strategy_params_len : felt,
    house_strategy_params : felt*,
    voting_strategy_params_flat_len : felt,
    voting_strategy_params_flat : felt*,
    voting_strategies_len : felt,
    voting_strategies : felt*,
    authenticators_len : felt,
    authenticators : felt*,
    executors_len : felt,
    executors : felt*,
):
    alloc_locals

    let (
        proposal_period_start_timestamp,
        proposal_period_duration,
        vote_period_duration,
        voting_power_multiplier,
        winner_count,
    ) = decode_param_array(house_strategy_params_len, house_strategy_params)

    # Sanity checks. Message cancellation is required on error.
    let (current_timestamp) = get_block_timestamp()
    with_attr error_message("Invalid constructor parameters"):
        assert_le(current_timestamp, proposal_period_start_timestamp)
        assert_not_zero(proposal_period_duration)
        assert_not_zero(vote_period_duration)
        assert_not_zero(voting_power_multiplier)
        assert_not_zero(winner_count)
        assert_le(winner_count, MAX_WINNERS)
        assert_not_zero(authenticators_len)

        # This strategy only supports a single voting strategy and executor
        assert voting_strategies_len = 1
        assert executors_len = 1
    end

    let proposal_period_end_timestamp = proposal_period_start_timestamp + proposal_period_duration
    let vote_period_end_timestamp = proposal_period_end_timestamp + vote_period_duration

    # Initialize the storage variables
    proposal_period_start_timestamp_store.write(proposal_period_start_timestamp)
    proposal_period_end_timestamp_store.write(proposal_period_end_timestamp)
    vote_period_end_timestamp_store.write(vote_period_end_timestamp)
    voting_power_multiplier_store.write(voting_power_multiplier)
    winner_count_store.write(winner_count)
    executor_store.write(executors[0])

    # Reconstruct the voting params 2D array (1 sub array per strategy) from the flattened version.
    # Currently there is no way to pass struct types with pointers in calldata, so we must do it this way.
    let (voting_strategy_params_all : Immutable2DArray) = Array2D.construct_array2d(
        voting_strategy_params_flat_len, voting_strategy_params_flat
    )

    add_voting_strategy(
        voting_strategies[0], voting_strategy_params_all, 0
    )
    unchecked_add_authenticators(authenticators_len, authenticators)

    # The first proposal in a round will have a proposal ID of 1.
    next_proposal_nonce_store.write(1)

    return ()
end

#
# Business logic
#

# Casts votes on one or more proposals
@external
func cast_votes{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    voter_address : Address,
    proposal_votes_len : felt,
    proposal_votes : ProposalVote*,
    user_voting_strategy_params_len : felt,
    user_voting_strategy_params : felt*,
) -> ():
    alloc_locals

    # Verify that the caller is the authenticator contract
    assert_valid_authenticator()

    # Verify that the funding round is active
    assert_round_active()

    # The snapshot timestamp is the end of the proposal submission period
    let (snapshot_timestamp) = proposal_period_end_timestamp_store.read()
    let vote_period_start_timestamp = snapshot_timestamp + 1
    let (vote_period_end_timestamp) = vote_period_end_timestamp_store.read()

    let (current_timestamp) = get_block_timestamp()

    # Ensure the round is still open for voting
    with_attr error_message("Vote period has ended"):
        assert_lt(current_timestamp, vote_period_end_timestamp)
    end

    # Ensure the vote period has started
    with_attr error_message("Vote period has not started yet"):
        assert_le(vote_period_start_timestamp, current_timestamp)
    end

    let (user_voting_power) = get_user_voting_power(
        snapshot_timestamp,
        voter_address,
        user_voting_strategy_params_len,
        user_voting_strategy_params,
    )
    let (no_voting_power) = uint256_eq(Uint256(0, 0), user_voting_power)

    with_attr error_message("No voting power for user"):
        assert no_voting_power = FALSE
    end

    let (spent_voting_power) = spent_voting_power_store.read(voter_address)
    let (remaining_voting_power) = SafeUint256.sub_le(user_voting_power, spent_voting_power)

    # Cast votes on each of the provided proposals
    cast_proposal_votes(
        voter_address,
        snapshot_timestamp,
        0,
        proposal_votes_len,
        proposal_votes,
        user_voting_power,
        remaining_voting_power,
    )
    return ()
end

# Recursively casts votes on each proposal in the `proposal_votes` array
func cast_proposal_votes{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    voter_address : Address,
    snapshot_timestamp : felt,
    current_index : felt,
    proposal_votes_len : felt,
    proposal_votes : ProposalVote*,
    user_voting_power_total : Uint256,
    user_voting_power_remaining : Uint256,
) -> ():
    alloc_locals

    if (current_index) == (proposal_votes_len):
        return ()
    end

    let proposal_vote = proposal_votes[current_index]

    let (proposer_address) = proposer_address_registry_store.read(proposal_votes.proposal_id)
    with_attr error_message("Proposal does not exist"):
        assert_not_zero(proposer_address.value)
    end

    let (has_been_cancelled) = cancelled_proposals_store.read(proposal_vote.proposal_id)

    # Make sure proposal has not been cancelled
    with_attr error_message("Proposal has been cancelled"):
        assert has_been_cancelled = FALSE
    end

    let (no_proposal_voting_power) = uint256_eq(Uint256(0, 0), proposal_vote.voting_power)

    # Make sure provided voting power is greater than zero
    with_attr error_message("Voting power must be greater than zero"):
        assert no_proposal_voting_power = FALSE
    end

    let (has_enough_voting_power) = uint256_le(proposal_vote.voting_power, user_voting_power_remaining)

    with_attr error_message("Not enough voting power remaining for user"):
        assert has_enough_voting_power = TRUE
    end

    let (previous_proposal_voting_power) = proposal_vote_power_store.read(proposal_vote.proposal_id)
    let (new_proposal_voting_power) = SafeUint256.add(proposal_vote.voting_power, previous_proposal_voting_power)

    let (new_remaining_voting_power) = SafeUint256.sub_le(user_voting_power_remaining, proposal_vote.voting_power)
    let (new_spent_voting_power) = SafeUint256.sub_le(user_voting_power_total, new_remaining_voting_power)

    proposal_vote_power_store.write(proposal_vote.proposal_id, new_proposal_voting_power)
    spent_voting_power_store.write(voter_address, new_spent_voting_power)

    # Emit event
    vote_created.emit(proposal_vote.proposal_id, voter_address, proposal_vote.voting_power)

    return cast_proposal_votes(
        voter_address,
        snapshot_timestamp,
        current_index + 1,
        proposal_votes_len,
        proposal_votes,
        user_voting_power_total,
        new_remaining_voting_power,
    )
end

# Submits a proposal to the funding round
# TODO: Create an L1 handler as a mechanism to bypass the spam protection filter
@external
func propose{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    proposer_address : Address,
    metadata_uri_string_len : felt,
    metadata_uri_len : felt,
    metadata_uri : felt*,
) -> ():
    alloc_locals

    # Verify that the caller is the authenticator contract
    assert_valid_authenticator()

    # Verify that the funding round is active
    assert_round_active()

    let (current_timestamp) = get_block_timestamp()
    let (proposal_period_start_timestamp) = proposal_period_start_timestamp_store.read()
    let (proposal_period_end_timestamp) = proposal_period_end_timestamp_store.read()

    # Ensure the proposal period period is still open
    with_attr error_message("Proposal period has ended"):
        assert_lt(current_timestamp, proposal_period_end_timestamp)
    end

    # Ensure the proposal period has started
    with_attr error_message("Proposal period has not started yet"):
        assert_le(proposal_period_start_timestamp, current_timestamp)
    end

    let (proposal_id) = next_proposal_nonce_store.read()

    # Store the proposal
    proposer_address_registry_store.write(proposal_id, proposer_address)

    # Emit event
    proposal_created.emit(
        proposal_id,
        proposer_address,
        metadata_uri_len,
        metadata_uri,
    )

    # Increase the proposal nonce
    next_proposal_nonce_store.write(proposal_id + 1)

    return ()
end

# Finalizes the round, counts the proposal votes, and send the corresponding result to the L1 executor contract
@external
func finalize_round{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr : SignatureBuiltin*,
    bitwise_ptr : BitwiseBuiltin*,
}():
    alloc_locals

    # Verify that the funding round is active
    assert_round_active()

    let (current_timestamp) = get_block_timestamp()
    let (vote_period_end_timestamp) = vote_period_end_timestamp_store.read()

    # Ensure that voting is complete
    with_attr error_message("Vote period has not ended"):
        assert_lt(vote_period_end_timestamp, current_timestamp)
    end

    let (num_winners) = winner_count_store.read()

    let (next_unused_proposal_nonce) = next_proposal_nonce_store.read()

    # If nonce 1 is unused, no proposals were received
    if next_unused_proposal_nonce == 1:
        return ()
    end

    let (active_submissions : ProposalInfo*) = alloc()
    let (active_submissions_len) = populate_proposal_info_arr(next_unused_proposal_nonce, 1, 0, active_submissions)

    let (winners) = ProposalUtils.select_winners(num_winners, active_submissions_len, active_submissions)
    let (winners_len) = MathUtils.min(num_winners, active_submissions_len)

    let (keccak_ptr : felt*) = alloc()
    let keccak_ptr_start = keccak_ptr

    let (leaves : Uint256*) = alloc()
    ProposalUtils.generate_leaves{keccak_ptr=keccak_ptr}(winners_len, winners, leaves, 0)

    # TODO: Add support for height calculation on the fly
    let (merkle_root) = MerkleTree.get_merkle_root{keccak_ptr=keccak_ptr}(
        winners_len, leaves, 0, MAX_LOG_N_WINNERS,
    )
    finalize_keccak(keccak_ptr_start, keccak_ptr)

    let (strategy_address) = get_caller_address()

    let (execution_params : felt*) = alloc()
    assert execution_params[0] = merkle_root.low
    assert execution_params[1] = merkle_root.high

    let (executor_address) = executor_store.read()
    let execution_params_len = 2

    IExecutionStrategy.execute(
        contract_address=executor_address,
        execution_params_len=execution_params_len,
        execution_params=execution_params,
    )

    # Flag the round as having been executed
    round_state_store.write(RoundState.EXECUTED)

    return ()
end

# Cancels the funding round. Only callable by the round initiator.
@external
func cancel_round{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr : SignatureBuiltin*,
    bitwise_ptr : BitwiseBuiltin*,
}():
    alloc_locals

    # Verify that the caller is the authenticator contract
    assert_valid_authenticator() # TODO: Add initiator_cancel block in `authenticate` if statement.

    # Verify that the funding round is active
    assert_round_active()

    # TODO: Send message to L1 to unlock funds.

    # Flag the round as having been cancelled
    round_state_store.write(RoundState.CANCELLED)

    return ()
end

# Cancels a proposal. Only callable by the proposal creator.
@external
func cancel_proposal{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    proposal_id : felt, execution_params_len : felt, execution_params : felt*
):
    alloc_locals

    # Verify that the caller is the authenticator contract
    assert_valid_authenticator() # TODO: Add cancel block in `authenticate` if statement.

    # Verify that the funding round is active
    assert_round_active()

    let (has_been_cancelled) = cancelled_proposals_store.read(proposal_id)

    # Make sure proposal has not already been cancelled
    with_attr error_message("Proposal already cancelled"):
        assert has_been_cancelled = 0
    end

    let (proposer_address) = proposer_address_registry_store.read(proposal_id)
    with_attr error_message("Invalid proposal id"):
        assert_not_zero(proposer_address.value)
    end

    # Flag this proposal as cancelled
    cancelled_proposals_store.write(proposal_id, 1)

    return ()
end

#
# View functions
#

# Fetches proposal information for a specific proposal id
@view
func get_proposal_info{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt
}(proposal_id : felt) -> (proposal_info : ProposalInfo):
    let (proposal_address) = proposer_address_registry_store.read(proposal_id)
    let (voting_power) = proposal_vote_power_store.read(proposal_id)

    return (
        ProposalInfo(proposal_id=proposal_id, proposer_address=proposal_address, voting_power=voting_power),
    )
end

#
#  Internal Functions
#

# Inserts the voting strategy to storage
func add_voting_strategy{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(voting_strategy : felt, params_all : Immutable2DArray, index : felt):
    alloc_locals

    voting_strategy_store.write(voting_strategy)

    # Extract voting params for the voting strategy
    let (params_len, params) = Array2D.get_sub_array(params_all, 0)

    # We store the length of the voting strategy params array at index zero
    voting_strategy_params_store.write(0, params_len)

    # The following elements are the actual params
    unchecked_add_voting_strategy_params(params_len, params, 1)
    return ()
end

# Inserts voting strategy params to storage
func unchecked_add_voting_strategy_params{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(params_len : felt, params : felt*, index : felt):
    if params_len == 0:
        # List is empty
        return ()
    else:
        # Store voting parameter
        voting_strategy_params_store.write(index, params[0])

        unchecked_add_voting_strategy_params(params_len - 1, &params[1], index + 1)
        return ()
    end
end

# Inserts authenticators to storage
func unchecked_add_authenticators{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(to_add_len : felt, to_add : felt*):
    if to_add_len == 0:
        return ()
    else:
        authenticators_store.write(to_add[0], 1)

        unchecked_add_authenticators(to_add_len - 1, &to_add[1])
        return ()
    end
end

# Throws if the caller address is not a member of the set of whitelisted authenticators (stored in the `authenticators` mapping)
func assert_valid_authenticator{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    ):
    let (caller_address) = get_caller_address()
    let (is_valid) = authenticators_store.read(caller_address)

    # Ensure it has been initialized
    with_attr error_message("Invalid authenticator"):
        assert_not_zero(is_valid)
    end

    return ()
end

# Throws if the round is not in an active state
func assert_round_active{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    ):
    let (round_state) = round_state_store.read()

    # Ensure the round is active
    with_attr error_message("Round not active"):
        assert round_state = RoundState.ACTIVE
    end

    return ()
end

# Computes the voting power of a user. That is, the raw voting power multiplied by the voting multiplier
func get_user_voting_power{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    current_timestamp : felt,
    voter_address : Address,
    user_voting_strategy_params_len : felt,
    user_voting_strategy_params : felt*,
) -> (user_voting_power : Uint256):
    alloc_locals

    let (voting_strategy) = voting_strategy_store.read()

    # Initialize empty array to store voting params
    let (voting_strategy_params : felt*) = alloc()

    # Check that voting strategy params exist by the length which is stored in the first element of the array
    let (voting_strategy_params_len) = voting_strategy_params_store.read(0)

    let (voting_strategy_params_len, voting_strategy_params) = get_voting_strategy_params(
        voting_strategy_params_len, voting_strategy_params, 1
    )

    let (raw_voting_power) = IVotingStrategy.get_voting_power(
        contract_address=voting_strategy,
        timestamp=current_timestamp,
        voter_address=voter_address,
        params_len=voting_strategy_params_len,
        params=voting_strategy_params,
        user_params_len=user_voting_strategy_params_len,
        user_params=user_voting_strategy_params,
    )
    let (voting_power_multiplier) = voting_power_multiplier_store.read()
    let (voting_power_multiplier_uint256) = FeltUtils.felt_to_uint256(voting_power_multiplier)
    let (user_voting_power) = SafeUint256.mul(raw_voting_power, voting_power_multiplier_uint256)

    return (user_voting_power)
end

# Reconstructs the voting param array
func get_voting_strategy_params{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    voting_strategy_params_len : felt,
    voting_strategy_params : felt*,
    index : felt,
) -> (voting_strategy_params_len : felt, voting_strategy_params : felt*):
    # The are no parameters so we just return an empty array
    if voting_strategy_params_len == 0:
        return (0, voting_strategy_params)
    end

    let (voting_strategy_param) = voting_strategy_params_store.read(index)
    assert voting_strategy_params[index - 1] = voting_strategy_param

    # All parameters have been added to the array so we can return it
    if index == voting_strategy_params_len:
        return (voting_strategy_params_len, voting_strategy_params)
    end

    let (voting_strategy_params_len, voting_strategy_params) = get_voting_strategy_params(
        voting_strategy_params_len, voting_strategy_params, index + 1
    )
    return (voting_strategy_params_len, voting_strategy_params)
end

# Decodes the array of house strategy params
func decode_param_array{range_check_ptr}(strategy_params_len : felt, strategy_params : felt*) -> (
    proposal_period_start_timestamp : felt,
    proposal_period_duration : felt,
    voting_duration : felt,
    voting_power_multiplier : felt,
    winner_count : felt,
):
    assert_nn_le(5, strategy_params_len)
    return (
        strategy_params[0],
        strategy_params[1],
        strategy_params[2],
        strategy_params[3],
        strategy_params[4],
    )
end

# Slices the provided proposal info array, returning the portion of it from `start` to `start + size`
func populate_proposal_info_arr{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    next_unused_proposal_nonce : felt,
    current_proposal_id : felt,
    current_index : felt,
    acc: ProposalInfo*,
) -> (proposal_info_len : felt):
    if current_proposal_id == next_unused_proposal_nonce:
        return (current_index + 1)
    end

    let (has_been_cancelled) = cancelled_proposals_store.read(current_proposal_id)
    if has_been_cancelled == TRUE:
        return populate_proposal_info_arr(next_unused_proposal_nonce, current_proposal_id + 1, current_index, acc)
    end

    let (proposer_address) = proposer_address_registry_store.read(current_proposal_id)
    let (voting_power) = proposal_vote_power_store.read(current_proposal_id)

    assert acc[current_index] = ProposalInfo(proposal_id=current_proposal_id, proposer_address=proposer_address,voting_power=voting_power)

    return populate_proposal_info_arr(next_unused_proposal_nonce, current_proposal_id + 1, current_index + 1, acc)
end
