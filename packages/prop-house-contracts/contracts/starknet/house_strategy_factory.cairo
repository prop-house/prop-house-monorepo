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
func starknet_messenger_store() -> (res: felt) {
}

@storage_var
func l1_house_store(strategy_address: felt) -> (house_address: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    starknet_messenger: felt
) {
    starknet_messenger_store.write(value=starknet_messenger);
    return ();
}

@view
func get_l1_house{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_address: felt
) -> (res: felt) {
    let (res) = l1_house_store.read(strategy_address);
    return (res,);
}

@view
func get_starknet_messenger{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res: felt
) {
    let (res) = starknet_messenger_store.read();
    return (res,);
}

func only_starknet_messenger{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    from_address_: felt
) {
    let (expected_from_address) = get_starknet_messenger();
    with_attr error_message(
            "HouseStrategyFactory: Expected call from starknet_messenger: {expected_from_address}") {
        assert from_address_ = expected_from_address;
    }
    return ();
}

@event
func house_strategy_initialized(
    house_address: felt, strategy_address: felt, strategy_class_hash: felt
) {
}

@l1_handler
func create_house_strategy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    from_address: felt,
    house_address: felt,
    house_strategy_class_hash: felt,
    house_strategy_params_len: felt,
    house_strategy_params: felt*,
    voting_strategy_hashes_len: felt,
    voting_strategy_hashes: felt*,
) {
    alloc_locals;
    only_starknet_messenger(from_address_=from_address);

    let (calldata: felt*) = alloc();
    assert calldata[0] = house_strategy_params_len;
    memcpy(calldata + 1, house_strategy_params, house_strategy_params_len);

    assert calldata[1 + house_strategy_params_len] = voting_strategy_hashes_len;
    memcpy(
        calldata + 2 + house_strategy_params_len, voting_strategy_hashes, voting_strategy_hashes_len
    );

    let calldata_len = 2 + house_strategy_params_len + voting_strategy_hashes_len;
    let (current_salt) = salt_store.read();

    let (strategy_address) = deploy(
        class_hash=house_strategy_class_hash,
        contract_address_salt=current_salt,
        constructor_calldata_size=calldata_len,
        constructor_calldata=calldata,
        deploy_from_zero=0,
    );
    l1_house_store.write(strategy_address, house_address);
    salt_store.write(value=current_salt + 1);

    house_strategy_initialized.emit(house_address, strategy_address, house_strategy_class_hash);
    return ();
}
