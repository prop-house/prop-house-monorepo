// SPDX-License-Identifier: GPL-3.0

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.alloc import alloc

from contracts.starknet.common.lib.array_utils import ArrayUtils

@storage_var
func voting_strategy_store(strategy_id: felt) -> (strategy_address: felt) {
}

@storage_var
func voting_strategy_params_store(strategy_id: felt, strategy_param_index: felt) -> (param: felt) {
}

@event
func voting_strategy_registered(
    strategy_id: felt, strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*
) {
}

// Returns the voting strategy address and params for the passed strategy ID
@view
func get_voting_strategy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    strategy_id: felt
) -> (strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*) {
    alloc_locals;

    let (voting_strategy) = voting_strategy_store.read(strategy_id);
    with_attr error_message("VotingStrategyRegistry: Strategy is not registered") {
        assert_not_zero(voting_strategy);
    }

    let (voting_strategy_params: felt*) = alloc();

    let (voting_strategy_params_len) = voting_strategy_params_store.read(strategy_id, 0);
    let (voting_strategy_params_len, voting_strategy_params) = _read_voting_strategy_params(
        strategy_id, voting_strategy_params_len, voting_strategy_params, 1
    );
    return (voting_strategy, voting_strategy_params_len, voting_strategy_params);
}

// Registers a voting strategy if it does not yet exist and returns the strategy ID
@external
func register_voting_strategy_if_not_exists{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt
}(strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*) -> (strategy_id: felt) {
    alloc_locals;

    let (strategy_id) = _compute_strategy_id(strategy_addr, strategy_params_len, strategy_params);
    let (voting_strategy) = voting_strategy_store.read(strategy_id);

    // Strategy is already registered. Return early.
    if (voting_strategy != 0) {
        return (strategy_id,);
    }

    voting_strategy_store.write(strategy_id, strategy_addr);

    // The length of the voting strategy params array is stored at index 0
    voting_strategy_params_store.write(strategy_id, 0, strategy_params_len);
    _write_voting_strategy_params(strategy_id, 1, strategy_params_len, strategy_params);

    voting_strategy_registered.emit(
        strategy_id, strategy_addr, strategy_params_len, strategy_params
    );
    return (strategy_id,);
}

//
//  Internal Functions
//

// Writes the strategy address and params to the provided array
func _populate_strategy_array{pedersen_ptr: HashBuiltin*}(
    strategy_addr: felt,
    strategy_params_len: felt,
    strategy_params: felt*,
    strategy_array: felt*,
    current_index: felt,
) {
    alloc_locals;

    if (current_index == 0) {
        assert strategy_array[current_index] = strategy_addr;

        _populate_strategy_array(
            strategy_addr, strategy_params_len, strategy_params, strategy_array, current_index + 1
        );
        return ();
    } else {
        if (strategy_params_len == 0) {
            return ();
        } else {
            assert strategy_array[current_index] = strategy_params[current_index - 1];

            _populate_strategy_array(
                strategy_addr,
                strategy_params_len - 1,
                &strategy_params[1],
                strategy_array,
                current_index + 1,
            );
            return ();
        }
    }
}

// Computes the strategy ID using the strategy address and params
func _compute_strategy_id{pedersen_ptr: HashBuiltin*}(
    strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*
) -> (strategy_id: felt) {
    alloc_locals;

    let (strategy_array: felt*) = alloc();
    _populate_strategy_array(
        strategy_addr, strategy_params_len, strategy_params, strategy_array, 0
    );

    let (strategy_id) = ArrayUtils.hash(1 + strategy_params_len, strategy_array);
    return (strategy_id,);
}

// Writes the voting strategy params to storage for the provided strategy hash
func _write_voting_strategy_params{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt, strategy_param_index: felt, strategy_params_len: felt, strategy_params: felt*
) {
    if (strategy_params_len == 0) {
        // List is empty
        return ();
    } else {
        // Store voting parameter
        voting_strategy_params_store.write(strategy_id, strategy_param_index, strategy_params[0]);

        _write_voting_strategy_params(
            strategy_id, strategy_param_index + 1, strategy_params_len - 1, &strategy_params[1]
        );
        return ();
    }
}

// Reconstructs the voting strategy param array for the provided strategy id
func _read_voting_strategy_params{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt, strategy_params_len: felt, strategy_params: felt*, current_index: felt
) -> (strategy_params_len: felt, strategy_params: felt*) {
    // The are no parameters so we just return an empty array
    if (strategy_params_len == 0) {
        return (0, strategy_params);
    }

    let (strategy_param) = voting_strategy_params_store.read(strategy_id, current_index);
    assert strategy_params[current_index - 1] = strategy_param;

    // All parameters have been added to the array so we can return it
    if (current_index == strategy_params_len) {
        return (strategy_params_len, strategy_params);
    }

    let (strategy_params_len, strategy_params) = _read_voting_strategy_params(
        strategy_id, strategy_params_len, strategy_params, current_index + 1
    );
    return (strategy_params_len, strategy_params);
}
