%lang starknet

# Standard Library
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address
from starkware.starknet.common.messages import send_message_to_l1

# Interfaces
from src.starknet.Interfaces.IHouseStrategyFactory import IHouseStrategyFactory

# Types
from src.starknet.lib.execution_type import ExecutionType

# House strategy factory address
@storage_var
func house_strategy_factory_address_store() -> (res : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    house_strategy_factory_address : felt
):
    house_strategy_factory_address_store.write(value=house_strategy_factory_address)
    return ()
end

@external
func execute{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    execution_params_len : felt, execution_params : felt*
):
    alloc_locals

    # Only params should be merkle root split into two parts
    with_attr error_message("Invalid execution param array"):
        assert execution_params_len = 2
    end

    let (l1_house_address) = get_l1_house_address_for_caller()
    with_attr error_message("Caller is not a valid house strategy"):
        assert_not_zero(l1_house_address)
    end

    let merkle_root_low = execution_params[0]
    let merkle_root_high = execution_params[1]

    # Create the payload
    let (message_payload : felt*) = alloc()
    assert message_payload[0] = ExecutionType.MERKLE_ROOT
    assert message_payload[1] = merkle_root_low
    assert message_payload[2] = merkle_root_high

    let payload_size = 3

    # Send message to L1 Contract
    send_message_to_l1(
        to_address=l1_house_address, payload_size=payload_size, payload=message_payload
    )
    return ()
end

# Fetches the L1 house address for the given caller (strategy)
func get_l1_house_address_for_caller{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}() -> (l1_house_address : felt):
    let (house_strategy_factory_address) = house_strategy_factory_address_store.read()
    let (caller_address) = get_caller_address()

    let (l1_house_address) = IHouseStrategyFactory.get_l1_house(
        contract_address=house_strategy_factory_address, strategy_address=caller_address
    )
    return (l1_house_address)
end
