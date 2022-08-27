# SPDX-License-Identifier: MIT

%lang starknet

# Standard Library
from starkware.starknet.common.syscalls import get_caller_address, get_block_timestamp
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_lt, uint256_le, uint256_eq
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
from src.starknet.lib.round_state import RoundState

# Libraries
from src.starknet.lib.array_2d import Array2D, Immutable2DArray
from src.starknet.lib.proposal_utils import ProposalUtils
from src.starknet.lib.felt_utils import FeltUtils

#
# Storage
#

@storage_var
func round_state_store() -> (count : felt):
end

@storage_var
func proposing_start_timestamp_store() -> (timestamp : felt):
end

@storage_var
func proposing_end_timestamp_store() -> (timestamp : felt):
end

@storage_var
func voting_end_timestamp_store() -> (timestamp : felt):
end

# voting_weight_multiplier?
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
func vote_power_store(proposal_id : felt) -> (power : Uint256):
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
func voting_strategies_store(strategy_address : felt) -> (is_valid : felt):
end

@storage_var
func voting_strategy_params_store(voting_strategy_contract : felt, index : felt) -> (
    voting_strategy_param : felt
):
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
func vote_created(proposal_id : felt, voter_address : Address, voting_power : felt):
end

# TODO: Check not cancelled when proposing/voting.

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
    executor : felt,
):
    alloc_locals

    let (
        proposing_start_timestamp,
        proposing_duration,
        voting_duration,
        voting_power_multiplier,
        winner_count,
    ) = decode_param_array(house_strategy_params_len, house_strategy_params)

    # TODO: Cancel if this fails or set to a state where funds can be returned via a REFUND (ERROR?)
    # Sanity checks
    let (current_timestamp) = get_block_timestamp()
    with_attr error_message("Invalid constructor parameters"):
        assert_le(current_timestamp, proposing_start_timestamp)
        assert_not_zero(proposing_duration)
        assert_not_zero(voting_duration)
        assert_not_zero(voting_power_multiplier)
        assert_not_zero(winner_count)
        assert_not_zero(voting_strategies_len)
        assert_not_zero(authenticators_len)
        assert_not_zero(executor)
    end

    let proposing_end_timestamp = proposing_start_timestamp + proposing_duration
    let voting_end_timestamp = proposing_end_timestamp + voting_duration

    # Initialize the storage variables
    proposing_start_timestamp_store.write(proposing_start_timestamp)
    proposing_end_timestamp_store.write(proposing_end_timestamp)
    voting_end_timestamp_store.write(voting_end_timestamp)
    voting_power_multiplier_store.write(voting_power_multiplier)
    winner_count_store.write(winner_count)
    executor_store.write(executor)

    # Reconstruct the voting params 2D array (1 sub array per strategy) from the flattened version.
    # Currently there is no way to pass struct types with pointers in calldata, so we must do it this way.
    let (voting_strategy_params_all : Immutable2DArray) = Array2D.construct_array2d(
        voting_strategy_params_flat_len, voting_strategy_params_flat
    )

    unchecked_add_voting_strategies(
        voting_strategies_len, voting_strategies, voting_strategy_params_all, 0
    )
    unchecked_add_authenticators(authenticators_len, authenticators)

    # The first proposal in a round will have a proposal ID of 1.
    next_proposal_nonce_store.write(1)

    return ()
end

#
# Business logic
#

# TODO: Batch voting


@external
func vote_for{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    voter_address : Address,
    proposal_id : felt,
    voting_power : felt,
    used_voting_strategies_len : felt,
    used_voting_strategies : felt*,
    user_voting_strategy_params_flat_len : felt,
    user_voting_strategy_params_flat : felt*,
) -> ():
    alloc_locals

    # Verify that the caller is the authenticator contract.
    assert_valid_authenticator()

    # Verify that the funding round is active
    assert_round_active()

    let (proposer_address) = proposer_address_registry_store.read(proposal_id)
    with_attr error_message("Proposal does not exist"):
        assert_not_zero(proposer_address.value)
    end

    # The snapshot timestamp is the end of the proposal submission period
    let (snapshot_timestamp) = proposing_end_timestamp_store.read()
    let voting_start_timestamp = snapshot_timestamp + 1
    let (voting_end_timestamp) = voting_end_timestamp_store.read()

    let (current_timestamp) = get_block_timestamp()

    # Ensure the round is still open for voting
    with_attr error_message("Voting period has ended"):
        assert_lt(current_timestamp, voting_end_timestamp)
    end

    # Ensure the voting period has started
    with_attr error_message("Voting has not started yet"):
        assert_le(voting_start_timestamp, current_timestamp)
    end

    # TODO: Instead, ensure that they have votes left

    # Reconstruct the voting params 2D array (1 sub array per strategy) from the flattened version.
    let (user_voting_strategy_params_all : Immutable2DArray) = Array2D.construct_array2d(
        user_voting_strategy_params_flat_len, user_voting_strategy_params_flat
    )

    let (raw_voting_power) = get_cumulative_voting_power( # TODO: Should we only do this once and then track the remaining voting power?
        snapshot_timestamp,
        voter_address,
        used_voting_strategies_len,
        used_voting_strategies,
        user_voting_strategy_params_all,
        0,
    )
    let (no_voting_power) = uint256_eq(Uint256(0, 0), raw_voting_power)

    with_attr error_message("No voting power for user"):
        assert no_voting_power = 0
    end

    let (voting_power_multiplier) = voting_power_multiplier_store.read()
    let (voting_power_multiplier_uint256) = FeltUtils.felt_to_uint256(voting_power_multiplier)
    let (user_voting_power) = SafeUint256.mul(raw_voting_power, voting_power_multiplier_uint256)

    # TODO: Would be cheaper to store remaining voting power
    let (spent_voting_power) = spent_voting_power_store.read(voter_address)
    let (has_voting_power_remaining) = uint256_lt(spent_voting_power, user_voting_power)

    with_attr error_message("No voting power remaining for user"):
        assert has_voting_power_remaining = TRUE
    end

    let (previous_voting_power) = vote_power_store.read(proposal_id)
    let (new_voting_power) = SafeUint256.add(user_voting_power, previous_voting_power)

    let (new_spent_voting_power) = SafeUint256.add(spent_voting_power, user_voting_power)

    vote_power_store.write(proposal_id, new_voting_power)
    spent_voting_power_store.write(voter_address, new_spent_voting_power)

    # Emit event
    vote_created.emit(proposal_id, voter_address, voting_power)

    return ()
end

# maybe we should create an L1 handler for this :thinking:
# that way, if you fail spam protection then you can still propose.
@external
func propose{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    proposer_address : Address,
    metadata_uri_string_len : felt,
    metadata_uri_len : felt,
    metadata_uri : felt*,
) -> ():
    alloc_locals

    # Verify that the caller is the authenticator contract.
    assert_valid_authenticator()

    # Verify that the funding round is active
    assert_round_active()

    let (current_timestamp) = get_block_timestamp()
    let (proposing_start_timestamp) = proposing_start_timestamp_store.read()
    let (proposing_end_timestamp) = proposing_end_timestamp_store.read()

    # Ensure the proposing period is still open
    with_attr error_message("Proposing period has ended"):
        assert_lt(current_timestamp, proposing_end_timestamp)
    end

    # Ensure the proposing period has started
    with_attr error_message("Proposing has not started yet"):
        assert_le(proposing_start_timestamp, current_timestamp)
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

# TODO: May need to allow it to be finalized in batches due to step count limitations
# Finalizes the round, counts the proposal votes, and send the corresponding result to the L1 executor contract
@external
func finalize_round{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr : SignatureBuiltin*,
    bitwise_ptr : BitwiseBuiltin*,
}(proposal_id : felt, execution_params_len : felt, execution_params : felt*):
    alloc_locals

    # Verify that the funding round is active
    assert_round_active()

    let (current_timestamp) = get_block_timestamp()
    let (voting_end_timestamp) = voting_end_timestamp_store.read()

    # Ensure that voting is complete
    with_attr error_message("Voting has not been completed"):
        assert_lt(voting_end_timestamp, current_timestamp)
    end

    let (num_winners) = winner_count_store.read()

    let (next_unused_proposal_nonce) = next_proposal_nonce_store.read()

    # If nonce 1 is unused, no proposals were received
    if next_unused_proposal_nonce == 1:
        return ()
    end

    let (submissions : ProposalInfo*) = alloc()
    populate_proposal_info_arr(next_unused_proposal_nonce, 1, 0, submissions)

    let num_submissions = next_unused_proposal_nonce - 1
    let (winners) = ProposalUtils.select_winners(num_winners, num_submissions, submissions)

    let (executor_address) = executor_store.read()
    IExecutionStrategy.execute(
        contract_address=executor_address,
        execution_params_len=execution_params_len,
        execution_params=execution_params,
    )

    # Flag the round as having been executed
    round_state_store.write(RoundState.EXECUTED)

    return ()
end

@external
func cancel_round{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr : SignatureBuiltin*,
    bitwise_ptr : BitwiseBuiltin*,
}():
    alloc_locals

    # Verify that the caller is the authenticator contract.
    assert_valid_authenticator() # TODO: Add funder_cancel block in `authenticate` if statement.

    # Verify that the funding round is active
    assert_round_active()

    # TODO: Need to send message to L1 to unlock funds?

    # Flag the round as having been cancelled
    round_state_store.write(RoundState.CANCELLED)

    return ()
end

# TODO: Cancel round function.

# Cancels a proposal. Only callable by the proposal creator.
@external
func cancel_proposal{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    proposal_id : felt, execution_params_len : felt, execution_params : felt*
):
    alloc_locals

    # Verify that the caller is the authenticator contract.
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

@view
func get_proposal_info{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt
}(proposal_id : felt) -> (proposal_info : ProposalInfo):
    let (proposal_address) = proposer_address_registry_store.read(proposal_id)
    let (voting_power) = vote_power_store.read(proposal_id)

    return (
        ProposalInfo(proposal_id=proposal_id, proposer_address=proposal_address, voting_power=voting_power),
    )
end

#
#  Internal Functions
#

func unchecked_add_voting_strategies{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(to_add_len : felt, to_add : felt*, params_all : Immutable2DArray, index : felt):
    alloc_locals
    if to_add_len == 0:
        return ()
    else:
        voting_strategies_store.write(to_add[0], 1)

        # Extract voting params for the voting strategy
        let (params_len, params) = Array2D.get_sub_array(params_all, index)

        # We store the length of the voting strategy params array at index zero
        voting_strategy_params_store.write(to_add[0], 0, params_len)

        # The following elements are the actual params
        unchecked_add_voting_strategy_params(to_add[0], params_len, params, 1)

        unchecked_add_voting_strategies(to_add_len - 1, &to_add[1], params_all, index + 1)
        return ()
    end
end

func unchecked_add_voting_strategy_params{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(to_add : felt, params_len : felt, params : felt*, index : felt):
    if params_len == 0:
        # List is empty
        return ()
    else:
        # Store voting parameter
        voting_strategy_params_store.write(to_add, index, params[0])

        unchecked_add_voting_strategy_params(to_add, params_len - 1, &params[1], index + 1)
        return ()
    end
end

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

# Computes the cumulated voting power of a user by iterating over the voting strategies of `used_voting_strategies`.
# TODO: In the future we will need to transition to an array of `voter_address` because they might be different for different voting strategies.
func get_cumulative_voting_power{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    current_timestamp : felt,
    voter_address : Address,
    used_voting_strategies_len : felt,
    used_voting_strategies : felt*,
    user_voting_strategy_params_all : Immutable2DArray,
    index : felt,
) -> (voting_power : Uint256):
    alloc_locals

    if used_voting_strategies_len == 0:
        # Reached the end, stop iteration
        return (Uint256(0, 0))
    end

    let voting_strategy = used_voting_strategies[0]

    let (is_valid) = voting_strategies_store.read(voting_strategy)

    with_attr error_message("Invalid voting strategy"):
        assert is_valid = 1
    end

    # Extract voting params array for the voting strategy specified by the index
    let (user_voting_strategy_params_len, user_voting_strategy_params) = Array2D.get_sub_array(
        user_voting_strategy_params_all, index
    )

    # Initialize empty array to store voting params
    let (voting_strategy_params : felt*) = alloc()

    # Check that voting strategy params exist by the length which is stored in the first element of the array
    let (voting_strategy_params_len) = voting_strategy_params_store.read(voting_strategy, 0)

    let (voting_strategy_params_len, voting_strategy_params) = get_voting_strategy_params(
        voting_strategy, voting_strategy_params_len, voting_strategy_params, 1
    )

    let (user_voting_power) = IVotingStrategy.get_voting_power(
        contract_address=voting_strategy,
        timestamp=current_timestamp,
        voter_address=voter_address,
        params_len=voting_strategy_params_len,
        params=voting_strategy_params,
        user_params_len=user_voting_strategy_params_len,
        user_params=user_voting_strategy_params,
    )

    let (additional_voting_power) = get_cumulative_voting_power(
        current_timestamp,
        voter_address,
        used_voting_strategies_len - 1,
        &used_voting_strategies[1],
        user_voting_strategy_params_all,
        index + 1,
    )

    let (voting_power) = SafeUint256.add(user_voting_power, additional_voting_power)
    return (voting_power)
end

# Function to reconstruct voting param array for voting strategy specified
func get_voting_strategy_params{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    _voting_strategy_contract : felt,
    voting_strategy_params_len : felt,
    voting_strategy_params : felt*,
    index : felt,
) -> (voting_strategy_params_len : felt, voting_strategy_params : felt*):
    # The are no parameters so we just return an empty array
    if voting_strategy_params_len == 0:
        return (0, voting_strategy_params)
    end

    let (voting_strategy_param) = voting_strategy_params_store.read(
        _voting_strategy_contract, index
    )
    assert voting_strategy_params[index - 1] = voting_strategy_param

    # All parameters have been added to the array so we can return it
    if index == voting_strategy_params_len:
        return (voting_strategy_params_len, voting_strategy_params)
    end

    let (voting_strategy_params_len, voting_strategy_params) = get_voting_strategy_params(
        _voting_strategy_contract, voting_strategy_params_len, voting_strategy_params, index + 1
    )
    return (voting_strategy_params_len, voting_strategy_params)
end

func decode_param_array{range_check_ptr}(strategy_params_len : felt, strategy_params : felt*) -> (
    proposing_start_timestamp : felt,
    proposing_duration : felt,
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

# Slice the provided proposal info array, returning the portion of it from `start` to `start + size`.
func populate_proposal_info_arr{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    next_unused_proposal_nonce : felt,
    current_proposal_id : felt,
    current_index : felt,
    acc: ProposalInfo*,
) -> (proposal_info : ProposalInfo*):
    if current_proposal_id == next_unused_proposal_nonce:
        return (acc)
    end

    let (has_been_cancelled) = cancelled_proposals_store.read(current_proposal_id)
    if has_been_cancelled == TRUE:
        return populate_proposal_info_arr(next_unused_proposal_nonce, current_proposal_id + 1, current_index, acc)
    end

    let (proposer_address) = proposer_address_registry_store.read(current_proposal_id)
    let (voting_power) = vote_power_store.read(current_proposal_id)

    assert acc[current_index] = ProposalInfo(proposal_id=current_proposal_id, proposer_address=proposer_address,voting_power=voting_power)

    return populate_proposal_info_arr(next_unused_proposal_nonce, current_proposal_id + 1, current_index + 1, acc)
end
