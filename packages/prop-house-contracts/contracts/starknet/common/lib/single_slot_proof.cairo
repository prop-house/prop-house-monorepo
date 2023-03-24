// SPDX-License-Identifier: GPL-3.0

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, BitwiseBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_add, uint256_eq
from starkware.cairo.common.math import unsigned_div_rem, assert_nn_le

from contracts.starknet.common.lib.math_utils import MathUtils
from contracts.starknet.common.lib.timestamp import Timestamp
from contracts.starknet.common.lib.slot_key import SlotKey

struct StorageSlot {
    word_1: felt,
    word_2: felt,
    word_3: felt,
    word_4: felt,
}

@contract_interface
namespace IFactsRegistry {
    func get_storage_uint(
        block: felt,
        account_160: felt,
        slot: StorageSlot,
        proof_sizes_bytes_len: felt,
        proof_sizes_bytes: felt*,
        proof_sizes_words_len: felt,
        proof_sizes_words: felt*,
        proofs_concat_len: felt,
        proofs_concat: felt*,
    ) -> (res: Uint256) {
    }
}

// Address of the fact registry. This is an immutable value that can be set at contract deployment only.
@storage_var
func SingleSlotProof_fact_registry_store() -> (res: felt) {
}

@storage_var
func SingleSlotProof_timestamp_to_eth_block_number(timestamp: felt) -> (number: felt) {
}

namespace SingleSlotProof {
    func initializer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        fact_registry_address: felt, l1_headers_store_address: felt
    ) {
        SingleSlotProof_fact_registry_store.write(value=fact_registry_address);
        Timestamp.initializer(l1_headers_store_address);
        return ();
    }

    func get_storage_slot{
        syscall_ptr: felt*,
        pedersen_ptr: HashBuiltin*,
        range_check_ptr,
        bitwise_ptr: BitwiseBuiltin*,
    }(
        timestamp: felt,
        voter_address: felt,
        params_len: felt,
        params: felt*,
        user_params_len: felt,
        user_params: felt*,
    ) -> (storage_slot: Uint256) {
        alloc_locals;

        let (fact_registry_addr) = SingleSlotProof_fact_registry_store.read();

        let (eth_block_number) = Timestamp.get_eth_block_number(timestamp);
        let eth_block_number = eth_block_number - 1;  // temp shift - waiting for Herodotus fix

        // Decoding voting strategy parameters
        let (
            slot,
            proof_sizes_bytes_len,
            proof_sizes_bytes,
            proof_sizes_words_len,
            proof_sizes_words,
            proofs_concat_len,
            proofs_concat,
        ) = _decode_param_array(user_params_len, user_params);

        // Extracting individual parameters from parameter array
        with_attr error_message("SingleSlotProof: Invalid size parameters array") {
            assert params_len = 2;
        }
        // Contract address where the desired slot resides
        let contract_address = params[0];
        // Index of the desired slot
        let slot_index = params[1];

        // Checking slot proof is for the correct slot
        let (valid_slot) = SlotKey.get_slot_key(slot_index, voter_address);
        let (slot_uint256) = MathUtils.words_to_uint256(
            slot.word_1, slot.word_2, slot.word_3, slot.word_4
        );
        with_attr error_message("SingleSlotProof: Invalid slot proof provided") {
            // Checking that the slot proof corresponds to the correct slot
            assert valid_slot = slot_uint256;
            // Calling Herodotus Fact Registry to verify the storage proof of the slot value
            let (storage_slot) = IFactsRegistry.get_storage_uint(
                fact_registry_addr,
                eth_block_number,
                contract_address,
                slot,
                proof_sizes_bytes_len,
                proof_sizes_bytes,
                proof_sizes_words_len,
                proof_sizes_words,
                proofs_concat_len,
                proofs_concat,
            );
        }

        let (is_zero) = uint256_eq(Uint256(0, 0), storage_slot);
        with_attr error_message("SingleSlotProof: Slot is zero") {
            is_zero = 0;
        }

        // If any part of the voting strategy calculation is invalid, the storage value returned should be zero
        return (storage_slot,);
    }
}

//
//  Internal Functions
//

func _decode_param_array{range_check_ptr}(param_array_len: felt, param_array: felt*) -> (
    slot: StorageSlot,
    proof_sizes_bytes_len: felt,
    proof_sizes_bytes: felt*,
    proof_sizes_words_len: felt,
    proof_sizes_words: felt*,
    proofs_concat_len: felt,
    proofs_concat: felt*,
) {
    assert_nn_le(5, param_array_len);
    let slot: StorageSlot = StorageSlot(
        param_array[0], param_array[1], param_array[2], param_array[3]
    );
    let num_nodes = param_array[4];
    let proof_sizes_bytes_len = num_nodes;
    let proof_sizes_bytes = param_array + 5;
    let proof_sizes_words_len = num_nodes;
    let proof_sizes_words = param_array + 5 + num_nodes;
    let proofs_concat = param_array + 5 + 2 * num_nodes;
    let proofs_concat_len = param_array_len - 5 - 2 * num_nodes;
    // Could add check by summing proof_sizes_words array and checking that it is equal to proofs_concat_len
    // However this seems like unnecessary computation to do on-chain (proofs will fail if invalid params are sent anyway)
    return (
        slot,
        proof_sizes_bytes_len,
        proof_sizes_bytes,
        proof_sizes_words_len,
        proof_sizes_words,
        proofs_concat_len,
        proofs_concat,
    );
}
