%lang starknet

// Standard Library
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.messages import send_message_to_l1

// Interfaces
from contracts.starknet.common.interfaces.round_factory_interface import IRoundFactory

// Round factory address
@storage_var
func round_factory_store() -> (res: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    round_factory_address: felt
) {
    round_factory_store.write(value=round_factory_address);
    return ();
}

@external
func execute{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    execution_params_len: felt, execution_params: felt*
) {
    alloc_locals;

    let (l1_round_address) = _get_l1_round_address_for_caller();
    with_attr error_message("ETHStrategy: Caller is not a valid round") {
        assert_not_zero(l1_round_address);
    }

    // Send message to L1 round contract
    send_message_to_l1(
        to_address=l1_round_address, payload_size=execution_params_len, payload=execution_params
    );
    return ();
}

// Fetches the L1 round address for the given caller (L2 round)
func _get_l1_round_address_for_caller{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr
}() -> (l1_round_address: felt) {
    let (round_factory_address) = round_factory_store.read();
    let (caller_address) = get_caller_address();

    let (l1_round_address) = IRoundFactory.get_l1_round(
        contract_address=round_factory_address, l2_round_address=caller_address
    );
    return (l1_round_address,);
}
