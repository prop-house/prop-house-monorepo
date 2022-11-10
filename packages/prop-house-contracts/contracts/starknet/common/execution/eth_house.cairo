%lang starknet

// Standard Library
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.messages import send_message_to_l1

// Interfaces
from contracts.starknet.common.interfaces.house_strategy_factory_interface import IHouseStrategyFactory

// House strategy factory address
@storage_var
func house_strategy_factory_address_store() -> (res: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    house_strategy_factory_address: felt
) {
    house_strategy_factory_address_store.write(value=house_strategy_factory_address);
    return ();
}

@external
func execute{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    execution_params_len: felt, execution_params: felt*
) {
    alloc_locals;

    let (l1_house_address) = get_l1_house_address_for_caller();
    with_attr error_message("Caller is not a valid house strategy") {
        assert_not_zero(l1_house_address);
    }

    // Send message to L1 Contract
    send_message_to_l1(
        to_address=l1_house_address, payload_size=execution_params_len, payload=execution_params
    );
    return ();
}

// Fetches the L1 house address for the given caller (strategy)
func get_l1_house_address_for_caller{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() -> (l1_house_address: felt) {
    let (house_strategy_factory_address) = house_strategy_factory_address_store.read();
    let (caller_address) = get_caller_address();

    let (l1_house_address) = IHouseStrategyFactory.get_l1_house(
        contract_address=house_strategy_factory_address, strategy_address=caller_address
    );
    return (l1_house_address,);
}
