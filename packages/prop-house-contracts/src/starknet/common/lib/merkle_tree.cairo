%lang starknet

from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.pow import pow
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.uint256 import Uint256, uint256_le
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_keccak.keccak import keccak_uint256s, keccak_uint256s_bigend

from src.starknet.common.lib.felt_utils import FeltUtils

namespace MerkleTree:
    # Generate an array of uint256 leaves from the provided felt input
    # Note: The caller MUST call `finalize_keccak` on the `keccak_ptr`
    func generate_leaves{range_check_ptr, bitwise_ptr : BitwiseBuiltin*, keccak_ptr : felt*}(
        input_len : felt, input : felt*, acc : Uint256*, current_index : felt
    ) -> (leaves_ptr : Uint256*):
        alloc_locals

        if current_index == input_len:
            return (acc)
        end

        let (hash_input_arr : Uint256*) = alloc()
        let (item_uint256) = FeltUtils.felt_to_uint256(input[current_index])

        assert hash_input_arr[0] = item_uint256

        let (hash) = keccak_uint256s_bigend{keccak_ptr=keccak_ptr}(1, hash_input_arr)

        assert acc[current_index] = hash

        return generate_leaves(input_len, input, acc, current_index + 1)
    end

    # Calculate the merkle root for the provided uint256 leaves
    # Note: The caller MUST call `finalize_keccak` on the `keccak_ptr`
    func get_merkle_root{bitwise_ptr : BitwiseBuiltin*, range_check_ptr, keccak_ptr : felt*}(
        leaves_ptr_len : felt, leaves_ptr : Uint256*, left_index : felt, height : felt
    ) -> (root : Uint256):
        alloc_locals

        if height == 0:
            return (leaves_ptr[left_index])
        end

        let (curr1) = get_merkle_root(leaves_ptr_len, leaves_ptr, left_index, height - 1)
        let (interval_size) = pow(2, height)
        let right_index = left_index + interval_size - 1
        let (right_subtree_left_index, _) = unsigned_div_rem(left_index + right_index, 2)

        let (out_of_bounds) = is_le_felt(leaves_ptr_len, right_subtree_left_index + 1)
        if out_of_bounds == 1:
            return (curr1)
        else:
            let (curr2) = get_merkle_root(
                leaves_ptr_len, leaves_ptr, right_subtree_left_index + 1, height - 1
            )
        end

        let (input : Uint256*) = alloc()
        let (le) = uint256_le(curr1, curr2)

        if le == 1:
            assert input[0] = curr1
            assert input[1] = curr2
        else:
            assert input[0] = curr2
            assert input[1] = curr1
        end

        let (root) = keccak_uint256s_bigend{keccak_ptr=keccak_ptr}(2, input)

        return (root)
    end
end
