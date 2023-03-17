// SPDX-License-Identifier: GPL-3.0

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, BitwiseBuiltin
from starkware.cairo.common.math import assert_not_zero, assert_in_range
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc

from openzeppelin.security.safemath.library import SafeUint256

from contracts.starknet.common.lib.single_slot_proof import SingleSlotProof
from contracts.starknet.common.lib.math_utils import MathUtils

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    fact_registry_address: felt, l1_headers_store_address: felt
) {
    SingleSlotProof.initializer(fact_registry_address, l1_headers_store_address);
    return ();
}

@view
func get_voting_power{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*
}(
    timestamp: felt,
    voter_address: felt,
    params_len: felt,
    params: felt*,
    user_params_len: felt,
    user_params: felt*,
) -> (voting_power: Uint256) {
    alloc_locals;

    // Expects contract_address slot_index, with an optional voting_power_multiplier
    with_attr error_message("EthereumBalanceOf: Invalid param length") {
        assert_in_range(params_len, 2, 3);
    }

    let single_slot_params_len = 2;
    let (voting_power) = SingleSlotProof.get_storage_slot(
        timestamp,
        voter_address,
        single_slot_params_len,
        params,
        user_params_len,
        user_params,
    );
    if (params_len == 2) {
        return (voting_power,);
    }

    let voting_power_multiplier = params[2];
    with_attr error_message("EthereumBalanceOf: Voting power multiplier is zero") {
        assert_not_zero(voting_power_multiplier);
    }

    let (voting_power_multiplier_uint256) = MathUtils.felt_to_uint256(voting_power_multiplier);
    let (voting_power_product) = SafeUint256.mul(voting_power, voting_power_multiplier_uint256);

    return (voting_power_product,);
}
