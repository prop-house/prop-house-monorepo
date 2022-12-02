// SPDX-License-Identifier: GPL-3.0

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, BitwiseBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc

from openzeppelin.security.safemath.library import SafeUint256

from contracts.starknet.common.lib.general_address import Address
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
    voter_address: Address,
    params_len: felt,
    params: felt*,
    user_params_len: felt,
    user_params: felt*,
) -> (voting_power: Uint256) {
    alloc_locals;

    // Expects [contract_address, slot_index, voting_power_multiplier]
    assert params_len = 3;

    let single_slot_params_len = 2;
    let (single_slot_proof_params) = alloc();
    assert single_slot_proof_params[0] = params[0];
    assert single_slot_proof_params[1] = params[1];

    let voting_power_multiplier = params[2];
    assert_not_zero(voting_power_multiplier);

    let (raw_voting_power) = SingleSlotProof.get_storage_slot(
        timestamp,
        voter_address,
        single_slot_params_len,
        single_slot_proof_params,
        user_params_len,
        user_params,
    );
    let (voting_power_multiplier_uint256) = MathUtils.felt_to_uint256(voting_power_multiplier);
    let (voting_power) = SafeUint256.mul(raw_voting_power, voting_power_multiplier_uint256);

    return (voting_power,);
}
