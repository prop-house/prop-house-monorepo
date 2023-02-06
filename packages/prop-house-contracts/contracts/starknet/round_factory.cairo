%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.memcpy import memcpy
from starkware.starknet.common.syscalls import deploy, get_caller_address

@storage_var
func salt_store() -> (value: felt) {
}

@storage_var
func l1_messenger_store() -> (l1_messenger_address: felt) {
}

@storage_var
func l1_round_store(l2_round_address: felt) -> (l1_round_address: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l1_messenger: felt
) {
    l1_messenger_store.write(value=l1_messenger);
    return ();
}

@view
func get_l1_round{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    l2_round_address: felt
) -> (res: felt) {
    let (res) = l1_round_store.read(l2_round_address);
    return (res,);
}

@view
func get_l1_messenger{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = l1_messenger_store.read();
    return (res,);
}

func only_l1_messenger{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    from_address_: felt
) {
    let (expected_from_address) = get_l1_messenger();
    with_attr error_message(
            "RoundFactory: Expected call from l1_messenger: {expected_from_address}") {
        assert from_address_ = expected_from_address;
    }
    return ();
}

@event
func round_registered(l1_round_address: felt, l2_round_address: felt, round_class_hash: felt) {
}

@l1_handler
func register_round{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    from_address: felt,
    l1_round_address: felt,
    round_class_hash: felt,
    round_params_len: felt,
    round_params: felt*,
) {
    alloc_locals;
    only_l1_messenger(from_address_=from_address);

    let (calldata: felt*) = alloc();
    assert calldata[0] = round_params_len;
    memcpy(calldata + 1, round_params, round_params_len);

    let calldata_len = 1 + round_params_len;
    let (current_salt) = salt_store.read();

    let (l2_round_address) = deploy(
        class_hash=round_class_hash,
        contract_address_salt=current_salt,
        constructor_calldata_size=calldata_len,
        constructor_calldata=calldata,
        deploy_from_zero=0,
    );
    l1_round_store.write(l2_round_address, l1_round_address);
    salt_store.write(value=current_salt + 1);

    round_registered.emit(l1_round_address, l2_round_address, round_class_hash);
    return ();
}
