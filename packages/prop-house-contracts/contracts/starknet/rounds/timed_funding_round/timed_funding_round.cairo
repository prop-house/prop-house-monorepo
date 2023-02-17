// SPDX-License-Identifier: GPL-3.0

%lang starknet

// Standard Library
from starkware.starknet.common.syscalls import get_caller_address, get_block_timestamp
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin, BitwiseBuiltin
from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_lt,
    uint256_le,
    uint256_eq,
    uint256_unsigned_div_rem,
)
from starkware.cairo.common.cairo_keccak.keccak import keccak_uint256s_bigend
from starkware.cairo.common.cairo_keccak.keccak import finalize_keccak
from starkware.cairo.common.registers import get_label_location
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import (
    assert_lt,
    assert_le,
    assert_nn,
    assert_nn_le,
    assert_not_zero,
)

// External Libraries
from openzeppelin.security.safemath.library import SafeUint256

// Interfaces
from contracts.starknet.common.interfaces.voting_strategy_interface import IVotingStrategy
from contracts.starknet.common.interfaces.execution_strategy_interface import IExecutionStrategy
from contracts.starknet.common.interfaces.voting_strategy_registry_interface import (
    IVotingStrategyRegistry,
)

// Types
from contracts.starknet.common.lib.execution_type import ExecutionType
from contracts.starknet.rounds.timed_funding_round.lib.proposal_info import ProposalInfo
from contracts.starknet.rounds.timed_funding_round.lib.proposal_vote import ProposalVote
from contracts.starknet.rounds.timed_funding_round.lib.round_state import RoundState
from contracts.starknet.rounds.timed_funding_round.lib.award import Award

// Libraries
from contracts.starknet.common.lib.math_utils import MathUtils
from contracts.starknet.common.lib.merkle_keccak import MerkleKeccak
from contracts.starknet.common.lib.array_utils import ArrayUtils, Immutable2DArray
from contracts.starknet.rounds.timed_funding_round.lib.proposal_utils import ProposalUtils

//
// Constants
//

const MAX_WINNERS = 256;

const MAX_LOG_N_WINNERS = 8;

//
// Deployment-Time Constants
//

const voting_strategy_registry = 0xDEAD0001;

const eth_execution_strategy = 0xDEAD0002;

const eth_tx_auth_strategy = 0xDEAD0003;

const eth_sig_auth_strategy = 0xDEAD0004;

//
// Storage
//

@storage_var
func round_state_store() -> (state: felt) {
}

@storage_var
func round_timestamps_store() -> (packed_timestamps: felt) {
}

@storage_var
func award_hash_store() -> (award_hash: Uint256) {
}

@storage_var
func winner_count_store() -> (count: felt) {
}

@storage_var
func next_proposal_nonce_store() -> (nonce: felt) {
}

@storage_var
func proposal_vote_power_store(proposal_id: felt) -> (power: Uint256) {
}

@storage_var
func spent_voting_power_store(voter_address: felt) -> (power: Uint256) {
}

@storage_var
func proposer_address_registry_store(proposal_id: felt) -> (proposer_address: felt) {
}

@storage_var
func cancelled_proposals_store(proposal_id: felt) -> (cancelled: felt) {
}

@storage_var
func registered_voting_strategies_store(strategy_id: felt) -> (registered: felt) {
}

//
// Events
//

@event
func proposal_created(
    proposal_id: felt, proposer_address: felt, metadata_uri_len: felt, metadata_uri: felt*
) {
}

@event
func proposal_cancelled(proposal_id: felt) {
}

@event
func vote_created(proposal_id: felt, voter_address: felt, voting_power: Uint256) {
}

@event
func round_finalized(merkle_root: Uint256, winners_len: felt, winners: ProposalInfo*) {
}

//
// Constructor
//

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    round_params_len: felt, round_params: felt*
) {
    alloc_locals;

    let (
        award_hash_low,
        award_hash_high,
        proposal_period_start_timestamp,
        proposal_period_duration,
        vote_period_duration,
        winner_count,
        voting_strategies_len,
        voting_strategies,
        voting_strategy_params_all,
    ) = _decode_param_array(round_params_len, round_params);

    // Sanity checks. Message cancellation is required on error.
    // Note that it is possible for the proposal period to be active upon creation,
    // however it is unlikely due to the scheduling checks on L1.
    with_attr error_message("TimedFundingRound: Invalid constructor parameters") {
        assert_not_zero(award_hash_low);
        assert_not_zero(award_hash_high);
        assert_not_zero(proposal_period_start_timestamp);
        assert_not_zero(proposal_period_duration);
        assert_not_zero(vote_period_duration);
        assert_not_zero(winner_count);
        assert_le(winner_count, MAX_WINNERS);
        assert_not_zero(voting_strategies_len);
    }

    let proposal_period_end_timestamp = proposal_period_start_timestamp + proposal_period_duration;
    let vote_period_end_timestamp = proposal_period_end_timestamp + vote_period_duration;

    // Pack the timestamps into a single felt to reduce storage usage
    let (packed_timestamps) = MathUtils.pack_3_40_bit(
        proposal_period_start_timestamp, proposal_period_end_timestamp, vote_period_end_timestamp
    );

    // Initialize the storage variables
    round_timestamps_store.write(packed_timestamps);
    award_hash_store.write(Uint256(low=award_hash_low, high=award_hash_high));
    winner_count_store.write(winner_count);

    // Register the voting strategies and store the strategy IDs
    _register_voting_strategies(
        voting_strategies_len, voting_strategies, voting_strategy_params_all, 0
    );

    // The first proposal in a round will have a proposal ID of 1.
    next_proposal_nonce_store.write(1);

    return ();
}

//
// Business logic
//

// Casts votes on one or more proposals
@external
func vote{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    bitwise_ptr: BitwiseBuiltin*,
    range_check_ptr: felt,
}(
    voter_address: felt,
    proposal_votes_len: felt,
    proposal_votes: ProposalVote*,
    used_voting_strategy_ids_len: felt,
    used_voting_strategy_ids: felt*,
    user_voting_strategy_params_flat_len: felt,
    user_voting_strategy_params_flat: felt*,
) -> () {
    alloc_locals;

    // Verify that the caller is the auth strategy contract
    _assert_valid_auth_strategy();

    // Verify that the funding round is active
    _assert_round_active();

    // Unpack the the timestamps from the packed value
    let (round_timestamps) = round_timestamps_store.read();
    let (_, snapshot_timestamp, vote_period_end_timestamp) = MathUtils.unpack_3_40_bit(
        round_timestamps
    );

    // The snapshot timestamp is the end of the proposal submission period
    let vote_period_start_timestamp = snapshot_timestamp + 1;
    let (current_timestamp) = get_block_timestamp();

    // Ensure the round is still open for voting
    with_attr error_message("TimedFundingRound: Vote period has ended") {
        assert_lt(current_timestamp, vote_period_end_timestamp);
    }

    // Ensure the vote period has started
    with_attr error_message("TimedFundingRound: Vote period has not started yet") {
        assert_le(vote_period_start_timestamp, current_timestamp);
    }

    // Reconstruct the voting params 2D array (1 sub array per strategy) from the flattened version.
    let (user_voting_strategy_params_all: Immutable2DArray) = ArrayUtils.construct_array2d(
        user_voting_strategy_params_flat_len, user_voting_strategy_params_flat
    );

    let (user_voting_power) = _get_cumulative_voting_power(
        snapshot_timestamp,
        voter_address,
        used_voting_strategy_ids_len,
        used_voting_strategy_ids,
        user_voting_strategy_params_all,
        0,
    );
    let (no_voting_power) = uint256_eq(Uint256(0, 0), user_voting_power);

    with_attr error_message("TimedFundingRound: No voting power for user") {
        assert no_voting_power = FALSE;
    }

    let (spent_voting_power) = spent_voting_power_store.read(voter_address);
    let (remaining_voting_power) = SafeUint256.sub_le(user_voting_power, spent_voting_power);

    // Cast votes on each of the provided proposals
    cast_proposal_votes(
        voter_address,
        snapshot_timestamp,
        0,
        proposal_votes_len,
        proposal_votes,
        user_voting_power,
        remaining_voting_power,
    );
    return ();
}

// Recursively casts votes on each proposal in the `proposal_votes` array
func cast_proposal_votes{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    voter_address: felt,
    snapshot_timestamp: felt,
    current_index: felt,
    proposal_votes_len: felt,
    proposal_votes: ProposalVote*,
    user_voting_power_total: Uint256,
    user_voting_power_remaining: Uint256,
) -> () {
    alloc_locals;

    if ((current_index) == (proposal_votes_len)) {
        return ();
    }

    let proposal_vote = proposal_votes[current_index];

    let (proposer_address) = proposer_address_registry_store.read(proposal_votes.proposal_id);
    with_attr error_message("TimedFundingRound: Proposal does not exist") {
        assert_not_zero(proposer_address);
    }

    let (has_been_cancelled) = cancelled_proposals_store.read(proposal_vote.proposal_id);

    // Make sure proposal has not been cancelled
    with_attr error_message("TimedFundingRound: Proposal has been cancelled") {
        assert has_been_cancelled = FALSE;
    }

    let (no_proposal_voting_power) = uint256_eq(Uint256(0, 0), proposal_vote.voting_power);

    // Make sure provided voting power is greater than zero
    with_attr error_message("TimedFundingRound: Voting power must be greater than zero") {
        assert no_proposal_voting_power = FALSE;
    }

    let (has_enough_voting_power) = uint256_le(
        proposal_vote.voting_power, user_voting_power_remaining
    );

    with_attr error_message("TimedFundingRound: Not enough voting power remaining for user") {
        assert has_enough_voting_power = TRUE;
    }

    let (previous_proposal_voting_power) = proposal_vote_power_store.read(
        proposal_vote.proposal_id
    );
    let (new_proposal_voting_power) = SafeUint256.add(
        proposal_vote.voting_power, previous_proposal_voting_power
    );

    let (new_remaining_voting_power) = SafeUint256.sub_le(
        user_voting_power_remaining, proposal_vote.voting_power
    );
    let (new_spent_voting_power) = SafeUint256.sub_le(
        user_voting_power_total, new_remaining_voting_power
    );

    proposal_vote_power_store.write(proposal_vote.proposal_id, new_proposal_voting_power);
    spent_voting_power_store.write(voter_address, new_spent_voting_power);

    // Emit event
    vote_created.emit(proposal_vote.proposal_id, voter_address, proposal_vote.voting_power);

    return cast_proposal_votes(
        voter_address,
        snapshot_timestamp,
        current_index + 1,
        proposal_votes_len,
        proposal_votes,
        user_voting_power_total,
        new_remaining_voting_power,
    );
}

// Submits a proposal to the funding round
@external
func propose{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    bitwise_ptr: BitwiseBuiltin*,
    range_check_ptr: felt,
}(
    proposer_address: felt,
    metadata_uri_string_len: felt,
    metadata_uri_len: felt,
    metadata_uri: felt*,
) -> () {
    alloc_locals;

    // Verify that the caller is the auth strategy contract
    _assert_valid_auth_strategy();

    // Verify that the funding round is active
    _assert_round_active();

    // Unpack the the timestamps from the packed value
    let (round_timestamps) = round_timestamps_store.read();
    let (
        proposal_period_start_timestamp, proposal_period_end_timestamp, _
    ) = MathUtils.unpack_3_40_bit(round_timestamps);

    let (current_timestamp) = get_block_timestamp();

    // Ensure the proposal period period is still open
    with_attr error_message("TimedFundingRound: Proposal period has ended") {
        assert_lt(current_timestamp, proposal_period_end_timestamp);
    }

    // Ensure the proposal period has started
    with_attr error_message("TimedFundingRound: Proposal period has not started yet") {
        assert_le(proposal_period_start_timestamp, current_timestamp);
    }

    let (proposal_id) = next_proposal_nonce_store.read();

    // Store the proposal
    proposer_address_registry_store.write(proposal_id, proposer_address);

    // Emit event
    proposal_created.emit(proposal_id, proposer_address, metadata_uri_len, metadata_uri);

    // Increase the proposal nonce
    next_proposal_nonce_store.write(proposal_id + 1);

    return ();
}

// Finalizes the round, counts the proposal votes, and send the corresponding result to the L1 execution strategy contract
@external
func finalize_round{
    syscall_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr: SignatureBuiltin*,
    bitwise_ptr: BitwiseBuiltin*,
}(awards_len: felt, awards: Award*) {
    alloc_locals;

    // Verify that the funding round is active
    _assert_round_active();

    let (current_timestamp) = get_block_timestamp();
    // Unpack the the timestamps from the packed value
    let (round_timestamps) = round_timestamps_store.read();
    let (_, _, vote_period_end_timestamp) = MathUtils.unpack_3_40_bit(round_timestamps);

    // Ensure that voting is complete
    with_attr error_message("TimedFundingRound: Vote period has not ended") {
        assert_lt(vote_period_end_timestamp, current_timestamp);
    }

    let (num_winners) = winner_count_store.read();
    let (next_unused_proposal_nonce) = next_proposal_nonce_store.read();

    // If nonce 1 is unused, no proposals were received
    if (next_unused_proposal_nonce == 1) {
        return ();  // TODO: Should still change the round state. Any need to notify L1?
    }

    let (active_submissions: ProposalInfo*) = alloc();
    let (active_submissions_len) = _populate_proposal_info_arr(
        next_unused_proposal_nonce, 1, 0, active_submissions
    );

    let (winners) = ProposalUtils.select_winners(
        num_winners, active_submissions_len, active_submissions
    );
    let (winners_len) = MathUtils.min(num_winners, active_submissions_len);

    let (keccak_ptr: felt*) = alloc();
    let keccak_ptr_start = keccak_ptr;

    let (awards_flat_len, awards_flat) = _flatten_and_abi_encode_award_array(awards_len, awards);

    let (award_hash) = award_hash_store.read();
    let (recovered_award_hash) = keccak_uint256s_bigend{keccak_ptr=keccak_ptr}(
        awards_flat_len, awards_flat
    );
    let (award_hashes_match) = uint256_eq(award_hash, recovered_award_hash);
    with_attr error_message("TimedFundingRound: Invalid award array") {
        assert_not_zero(award_hashes_match);
    }

    let (leaves: Uint256*) = alloc();

    // If only one award exists in the array, then split it between the winners.
    if (awards_len == 1) {
        let (winners_len_uint256) = MathUtils.felt_to_uint256(winners_len);
        let (split_award_amount, _) = uint256_unsigned_div_rem(
            awards[0].amount, winners_len_uint256
        );
        ProposalUtils.generate_leaves_for_split_award{keccak_ptr=keccak_ptr}(
            winners_len, winners, awards[0].asset_id, split_award_amount, leaves, 0
        );
    } else {
        ProposalUtils.generate_leaves_for_assigned_awards{keccak_ptr=keccak_ptr}(
            winners_len, winners, awards_len, awards, leaves, 0
        );
    }

    let (merkle_root) = MerkleKeccak.compute_merkle_root{keccak_ptr=keccak_ptr}(
        winners_len, leaves, 0, MAX_LOG_N_WINNERS
    );
    finalize_keccak(keccak_ptr_start, keccak_ptr);

    let (execution_params: felt*) = alloc();
    assert execution_params[0] = ExecutionType.MERKLE_PROOF;
    assert execution_params[1] = merkle_root.low;
    assert execution_params[2] = merkle_root.high;

    let execution_params_len = 3;

    IExecutionStrategy.execute(
        contract_address=eth_execution_strategy,
        execution_params_len=execution_params_len,
        execution_params=execution_params,
    );

    // Flag the round as having been finalized
    round_state_store.write(RoundState.FINALIZED);

    round_finalized.emit(merkle_root, winners_len, winners);

    return ();
}

// Cancels a proposal. Only callable by the proposal creator.
@external
func cancel_proposal{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    proposer_address: felt, proposal_id: felt
) {
    alloc_locals;

    // Verify that the caller is the auth strategy contract
    _assert_valid_auth_strategy();

    // Verify that the funding round is active
    _assert_round_active();

    let (has_been_cancelled) = cancelled_proposals_store.read(proposal_id);

    // Make sure proposal has not already been cancelled
    with_attr error_message("TimedFundingRound: Proposal already cancelled") {
        assert has_been_cancelled = 0;
    }

    let (stored_proposer_address) = proposer_address_registry_store.read(proposal_id);
    with_attr error_message("TimedFundingRound: Invalid proposal id") {
        assert_not_zero(stored_proposer_address);
        assert proposer_address = stored_proposer_address;
    }

    // Flag this proposal as cancelled
    cancelled_proposals_store.write(proposal_id, 1);

    // Emit event
    proposal_cancelled.emit(proposal_id);

    return ();
}

//
// View functions
//

// Fetches the round state
@view
func get_round_state{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}() -> (
    round_state: felt
) {
    let (round_state) = round_state_store.read();
    return (round_state,);
}

// Fetches proposal information for a specific proposal id
@view
func get_proposal_info{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    proposal_id: felt
) -> (proposal_info: ProposalInfo, is_cancelled: felt) {
    let (proposal_address) = proposer_address_registry_store.read(proposal_id);
    let (voting_power) = proposal_vote_power_store.read(proposal_id);
    let (is_cancelled) = cancelled_proposals_store.read(proposal_id);

    return (
        ProposalInfo(proposal_id=proposal_id, proposer_address=proposal_address, voting_power=voting_power),
        is_cancelled,
    );
}

//
//  Internal Functions
//

// Registers the voting strategies and stores the strategy IDs
func _register_voting_strategies{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    addresses_len: felt, addresses: felt*, params_all: Immutable2DArray, current_index: felt
) {
    alloc_locals;

    if (addresses_len == 0) {
        return ();
    } else {
        let (strategy_params_len, strategy_params) = ArrayUtils.get_sub_array(
            params_all, current_index
        );

        let (strategy_id) = IVotingStrategyRegistry.register_voting_strategy_if_not_exists(
            contract_address=voting_strategy_registry,
            strategy_addr=addresses[0],
            strategy_params_len=strategy_params_len,
            strategy_params=strategy_params,
        );
        registered_voting_strategies_store.write(strategy_id, TRUE);

        _register_voting_strategies(
            addresses_len - 1, &addresses[1], params_all, current_index + 1
        );
        return ();
    }
}

// Fetches the auth strategy at the provided index
func _get_auth_strategy(index: felt) -> (strategy_addr: felt) {
    let (data_address) = get_label_location(strategies);
    return ([data_address + index],);

    strategies:
    dw eth_tx_auth_strategy;
    dw eth_sig_auth_strategy;
}

// Determines whether the provided address is a valid auth strategy
func _is_valid_auth_strategy(addr: felt, current_index: felt, num_strategies: felt) -> (
    is_valid: felt
) {
    if (num_strategies == current_index) {
        return (FALSE,);
    }

    let (strategy_addr) = _get_auth_strategy(current_index);
    if (addr == strategy_addr) {
        return (TRUE,);
    }
    return _is_valid_auth_strategy(addr, current_index + 1, num_strategies);
}

// Throws if the caller address is not a member of the set of whitelisted auth strategies
func _assert_valid_auth_strategy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    ) {
    alloc_locals;

    let (caller_address) = get_caller_address();
    let (is_valid) = _is_valid_auth_strategy(caller_address, 0, 2);
    with_attr error_message("TimedFundingRound: Invalid auth strategy") {
        assert_not_zero(is_valid);
    }
    return ();
}

// Throws if the round is not in an active state
func _assert_round_active{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    let (round_state) = round_state_store.read();

    // Ensure the round is active
    with_attr error_message("TimedFundingRound: Round not active") {
        assert round_state = RoundState.ACTIVE;
    }

    return ();
}

// Computes the cumulated voting power of a user by iterating over the voting strategies of `used_voting_strategy_ids`.
func _get_cumulative_voting_power{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    current_timestamp: felt,
    voter_address: felt,
    used_voting_strategy_ids_len: felt,
    used_voting_strategy_ids: felt*,
    user_voting_strategy_params_all: Immutable2DArray,
    current_index: felt,
) -> (voting_power: Uint256) {
    // Make sure there are no duplicates to avoid an attack where people double count a voting strategy
    ArrayUtils.assert_no_duplicates(used_voting_strategy_ids_len, used_voting_strategy_ids);

    return _unchecked_get_cumulative_voting_power(
        current_timestamp,
        voter_address,
        used_voting_strategy_ids_len,
        used_voting_strategy_ids,
        user_voting_strategy_params_all,
        current_index,
    );
}

// Actual computation of voting power. Duplicates are checked in `get_cumulative_voting_power`.
func _unchecked_get_cumulative_voting_power{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}(
    current_timestamp: felt,
    voter_address: felt,
    used_voting_strategy_ids_len: felt,
    used_voting_strategy_ids: felt*,
    user_voting_strategy_params_all: Immutable2DArray,
    current_index: felt,
) -> (voting_power: Uint256) {
    alloc_locals;

    if (used_voting_strategy_ids_len == 0) {
        // Reached the end, stop iteration
        return (Uint256(0, 0),);
    }

    let voting_strategy_id = used_voting_strategy_ids[0];
    let (is_registered) = registered_voting_strategies_store.read(voting_strategy_id);
    with_attr error_message("TimedFundingRound: Strategy is not registered for round") {
        assert is_registered = TRUE;
    }

    let (
        voting_strategy_address, voting_strategy_params_len, voting_strategy_params
    ) = IVotingStrategyRegistry.get_voting_strategy(
        contract_address=voting_strategy_registry, strategy_id=voting_strategy_id
    );

    // Extract voting params array for the voting strategy specified by the index
    let (user_voting_strategy_params_len, user_voting_strategy_params) = ArrayUtils.get_sub_array(
        user_voting_strategy_params_all, current_index
    );

    let (user_voting_power) = IVotingStrategy.get_voting_power(
        contract_address=voting_strategy_address,
        timestamp=current_timestamp,
        voter_address=voter_address,
        params_len=voting_strategy_params_len,
        params=voting_strategy_params,
        user_params_len=user_voting_strategy_params_len,
        user_params=user_voting_strategy_params,
    );

    let (additional_voting_power) = _get_cumulative_voting_power(
        current_timestamp,
        voter_address,
        used_voting_strategy_ids_len - 1,
        &used_voting_strategy_ids[1],
        user_voting_strategy_params_all,
        current_index + 1,
    );

    let (voting_power) = SafeUint256.add(user_voting_power, additional_voting_power);
    return (voting_power,);
}

// Decodes the array of round params
func _decode_param_array{range_check_ptr}(round_params_len: felt, round_params: felt*) -> (
    award_hash_low: felt,
    award_hash_high: felt,
    proposal_period_start_timestamp: felt,
    proposal_period_duration: felt,
    vote_period_duration: felt,
    winner_count: felt,
    voting_strategies_len: felt,
    voting_strategies: felt*,
    voting_strategy_params_all: Immutable2DArray,
) {
    alloc_locals;

    let (voting_strategies: felt*) = alloc();
    let voting_strategies_len = round_params[6];
    memcpy(voting_strategies, round_params + 7, voting_strategies_len);

    let voting_strategy_params_flat_len = round_params[7 + voting_strategies_len];
    let (voting_strategy_params_flat: felt*) = alloc();
    memcpy(
        voting_strategy_params_flat,
        round_params + 8 + voting_strategies_len,
        voting_strategy_params_flat_len,
    );

    // Reconstruct the voting params 2D array (1 sub array per strategy) from the flattened version.
    let (voting_strategy_params_all: Immutable2DArray) = ArrayUtils.construct_array2d(
        voting_strategy_params_flat_len, voting_strategy_params_flat
    );

    return (
        round_params[0],
        round_params[1],
        round_params[2],
        round_params[3],
        round_params[4],
        round_params[5],
        voting_strategies_len,
        voting_strategies,
        voting_strategy_params_all,
    );
}

// Slices the provided proposal info array, returning the portion of it from `start` to `start + size`
func _populate_proposal_info_arr{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    next_unused_proposal_nonce: felt,
    current_proposal_id: felt,
    current_index: felt,
    acc: ProposalInfo*,
) -> (proposal_info_len: felt) {
    if (current_proposal_id == next_unused_proposal_nonce) {
        return (current_index,);
    }

    let (has_been_cancelled) = cancelled_proposals_store.read(current_proposal_id);
    if (has_been_cancelled == TRUE) {
        return _populate_proposal_info_arr(
            next_unused_proposal_nonce, current_proposal_id + 1, current_index, acc
        );
    }

    let (proposer_address) = proposer_address_registry_store.read(current_proposal_id);
    let (voting_power) = proposal_vote_power_store.read(current_proposal_id);

    assert acc[current_index] = ProposalInfo(proposal_id=current_proposal_id, proposer_address=proposer_address, voting_power=voting_power);

    return _populate_proposal_info_arr(
        next_unused_proposal_nonce, current_proposal_id + 1, current_index + 1, acc
    );
}

// Flattens and ABI-encodes (adds data offset + array length prefix) an array of award assets.
func _flatten_and_abi_encode_award_array{range_check_ptr}(awards_len: felt, awards: Award*) -> (
    awards_flat_len: felt, awards_flat: Uint256*
) {
    alloc_locals;

    let (data_offset) = MathUtils.felt_to_uint256(0x20);
    let (array_length) = MathUtils.felt_to_uint256(awards_len);

    let (awards_flat: Uint256*) = alloc();
    assert awards_flat[0] = data_offset;
    assert awards_flat[1] = array_length;
    memcpy(4 + awards_flat, awards, Award.SIZE * awards_len);

    // length = (data_offset + array_length) + (num_uint256_in_award * awards_len)
    return (2 + (2 * awards_len), awards_flat,);
}
