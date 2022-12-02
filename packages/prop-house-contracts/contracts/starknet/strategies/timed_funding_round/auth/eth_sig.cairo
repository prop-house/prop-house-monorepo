%lang starknet

from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_secp.signature import verify_eth_signature_uint256
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.cairo_keccak.keccak import (
    keccak_add_uint256s,
    keccak_bigend,
    finalize_keccak,
)

from contracts.starknet.common.lib.execute import execute
from contracts.starknet.strategies.timed_funding_round.lib.eip712 import EIP712

// print(get_selector_from_name("propose"))
const PROPOSAL_SELECTOR = 0x1bfd596ae442867ef71ca523061610682af8b00fc2738329422f4ad8d220b81;
// print(get_selector_from_name("vote"))
const VOTE_SELECTOR = 0x132bdf85fc8aa10ac3c22f02317f8f53d4b4f52235ed1eabb3a4cbbe08b5c41;
// print(get_selector_from_name("cancel_proposal"))
const CANCEL_PROPOSAL_SELECTOR = 0xf58b7fa5874c036308bea0b54ae78e8ecf78d868aa18e666aa7fc4e0cbed6d;
// print(get_selector_from_name("cancel_round"))
const CANCEL_ROUND_SELECTOR = 0x8af3ea41808c9515720e56add54a2d8008458a8bc5e347b791c6d75cd0e407;

@external
func authenticate{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr, bitwise_ptr: BitwiseBuiltin*
}(
    r: Uint256,
    s: Uint256,
    v: felt,
    salt: Uint256,
    target: felt,
    function_selector: felt,
    calldata_len: felt,
    calldata: felt*,
) -> () {
    if (function_selector == PROPOSAL_SELECTOR) {
        EIP712.verify_propose_sig(r, s, v, salt, target, calldata_len, calldata);
    } else {
        if (function_selector == VOTE_SELECTOR) {
            EIP712.verify_vote_sig(r, s, v, salt, target, calldata_len, calldata);
        } else {
            if (function_selector == CANCEL_PROPOSAL_SELECTOR) {
                EIP712.verify_cancel_proposal_sig(r, s, v, salt, target, calldata_len, calldata);
            } else {
                if (function_selector == CANCEL_ROUND_SELECTOR) {
                    EIP712.verify_cancel_round_sig(r, s, v, salt, target, calldata_len, calldata);
                } else {
                    // Invalid selector
                    return ();
                }
            }
        }
    }

    // Call the contract
    execute(target, function_selector, calldata_len, calldata);

    return ();
}
