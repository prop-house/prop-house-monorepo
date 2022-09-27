# SPDX-License-Identifier: GPL-3.0

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.math_cmp import is_le
from starkware.cairo.common.alloc import alloc

@storage_var
func l1_bridge_store() -> (l1_bridge : felt):
end

@storage_var
func voting_strategy_store(strategy_hash : felt) -> (strategy_address : felt):
end

@storage_var
func voting_strategy_params_store(strategy_hash : felt, param_index : felt) -> (param : felt):
end

@event
func voting_strategy_registered(strategy_hash : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    l1_bridge : felt
):
    l1_bridge_store.write(value=l1_bridge)
    return ()
end

@view
func get_voting_strategy{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt}(
    strategy_hash : felt
) -> (strategy_addr : felt, strategy_params_len : felt, strategy_params : felt*):
    alloc_locals

    let (voting_strategy) = voting_strategy_store.read(strategy_hash)
    let (voting_strategy_params : felt*) = alloc()
    if voting_strategy == 0:
        return (0, 0, voting_strategy_params)
    end

    let (voting_strategy_params_len) = voting_strategy_params_store.read(strategy_hash, 0)
    let (voting_strategy_params_len, voting_strategy_params) = get_voting_strategy_params(
        strategy_hash, voting_strategy_params_len, voting_strategy_params, 1
    )
    return (voting_strategy, voting_strategy_params_len, voting_strategy_params)
end

# Receives a voting strategy registration and stores it in the registry.
@l1_handler
func handle_register_voting_strategy{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr : felt
}(
    from_address : felt,
    strategy_hash : felt,
    strategy_addr : felt,
    strategy_params_len : felt,
    strategy_params : felt*,
):
    alloc_locals

    # Check L1 message origin is equal to the L1 messenger
    let (origin) = l1_bridge_store.read()
    with_attr error_message("Invalid message origin address"):
        assert from_address = origin
    end

    let (voting_strategy) = voting_strategy_store.read(strategy_hash)
    if voting_strategy != 0:
        return ()  # The strategy has already been registered. Exit early.
    end

    voting_strategy_store.write(strategy_hash, strategy_addr)

    # The length of the voting strategy params array is stored at index 0
    voting_strategy_params_store.write(strategy_hash, 0, strategy_params_len)
    write_voting_strategy_params(strategy_hash, 1, strategy_params_len, strategy_params)

    voting_strategy_registered.emit(strategy_hash)
    return ()
end

# Writes the voting strategy params to storage for the provided strategy hash
func write_voting_strategy_params{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(strategy_hash : felt, param_index : felt, params_len : felt, params : felt*):
    if params_len == 0:
        # List is empty
        return ()
    else:
        # Store voting parameter
        voting_strategy_params_store.write(strategy_hash, param_index, params[0])

        write_voting_strategy_params(strategy_hash, param_index + 1, params_len - 1, &params[1])
        return ()
    end
end

# Reconstructs the voting strategy param array for the provided strategy hash
func get_voting_strategy_params{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    strategy_hash : felt, params_len : felt, params : felt*, index : felt
) -> (params_len : felt, params : felt*):
    # The are no parameters so we just return an empty array
    if params_len == 0:
        return (0, params)
    end

    let (param) = voting_strategy_params_store.read(strategy_hash, index)
    assert params[index - 1] = param

    # All parameters have been added to the array so we can return it
    if index == params_len:
        return (params_len, params)
    end

    let (params_len, params) = get_voting_strategy_params(
        strategy_hash, params_len, params, index + 1
    )
    return (params_len, params)
end
