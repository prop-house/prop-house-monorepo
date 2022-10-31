from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.cairo.common.cairo_keccak.keccak import keccak_uint256s_bigend
from starkware.cairo.common.uint256 import Uint256, uint256_le, uint256_unsigned_div_rem

from contracts.starknet.common.lib.felt_utils import FeltUtils
from contracts.starknet.strategies.timed_funding_round.lib.proposal_info import ProposalInfo

namespace ProposalUtils {
    // Generate an array of uint256 leaves from the provided ProposalInfo array for the purposes
    // of building a merkle tree. Format: keccak256(proposal_id, uint256(uint160(proposer_address)), asset_id, amount)
    // Note: The caller MUST call `finalize_keccak` on the `keccak_ptr`
    func generate_leaves{range_check_ptr, bitwise_ptr: BitwiseBuiltin*, keccak_ptr: felt*}(
        proposal_info_arr_len: felt,
        proposal_info_arr: ProposalInfo*,
        awards_flat_len: felt,
        awards_flat: Uint256*,
        curr_award_index: felt,
        acc: Uint256*,
        curr_proposal_index: felt,
    ) -> (leaves_ptr: Uint256*) {
        alloc_locals;

        if (curr_proposal_index == proposal_info_arr_len) {
            return (acc,);
        }

        let (hash_input_arr: Uint256*) = alloc();
        let (proposal_id_uint256) = FeltUtils.felt_to_uint256(
            proposal_info_arr[curr_proposal_index].proposal_id
        );
        let (proposer_address_uint256) = FeltUtils.felt_to_uint256(
            proposal_info_arr[curr_proposal_index].proposer_address.value
        );

        assert hash_input_arr[0] = proposal_id_uint256;
        assert hash_input_arr[1] = proposer_address_uint256;
        assert hash_input_arr[2] = awards_flat[curr_award_index];
        assert hash_input_arr[3] = awards_flat[curr_award_index + 1];  // TODO: Split award amount if only one asset

        let (hash) = keccak_uint256s_bigend{keccak_ptr=keccak_ptr}(2, hash_input_arr);

        assert acc[curr_proposal_index] = hash;

        // If awards length is 4, then there is only one award in the array. Do not iterate. Format: [offset, length, asset_id, amount]
        if (awards_flat_len == 4) {
            return generate_leaves(
                proposal_info_arr_len,
                proposal_info_arr,
                awards_flat_len,
                awards_flat,
                curr_award_index,
                acc,
                curr_proposal_index + 1,
            );
        }

        return generate_leaves(
            proposal_info_arr_len,
            proposal_info_arr,
            awards_flat_len,
            awards_flat,
            curr_award_index + 2,
            acc,
            curr_proposal_index + 1,
        );
    }

    // Given an array of proposal information ordered by ascending proposal ID, return the winning proposals.
    // Winners: `num_winners` proposal(s), ordered by descending voting power.
    // Tie-Breaker: In the event of a tie, the proposal(s) which were received first will win.
    // To accurately make this determination, the provided array MUST be ordered by ascending proposal ID.
    func select_winners{range_check_ptr}(
        num_winners: felt, num_submissions: felt, submissions_ptr: ProposalInfo*
    ) -> (winning_proposals_ptr: ProposalInfo*) {
        alloc_locals;

        let (winning_proposals_ptr) = mergesort_by_voting_power_desc_and_slice(
            num_winners, num_submissions, submissions_ptr
        );
        return (winning_proposals_ptr,);
    }

    // Sort an array of proposal info by descending voting power using a modified mergesort algorithm,
    // which reduces the sorted array to the `num_winners` proposals with the most voting power.
    func mergesort_by_voting_power_desc_and_slice{range_check_ptr}(
        num_winners: felt, proposal_arr_len: felt, proposal_arr_ptr: ProposalInfo*
    ) -> (sorted_sliced_proposal_info_arr_ptr: ProposalInfo*) {
        alloc_locals;

        // Step 1. If len == 1 => return array
        if (proposal_arr_len == 1) {
            return (proposal_arr_ptr,);
        }

        // Step 2. Split list at middle
        let (left_arr_len, _) = unsigned_div_rem(proposal_arr_len, 2);
        let right_arr_len = proposal_arr_len - left_arr_len;

        // Step 3. Create left and right
        let left_arr = proposal_arr_ptr;
        let right_arr = proposal_arr_ptr + left_arr_len * ProposalInfo.SIZE;

        // Step 4. Recurse left and right
        let (sorted_left_arr) = mergesort_by_voting_power_desc_and_slice(
            num_winners, left_arr_len, left_arr
        );
        let (sorted_right_arr) = mergesort_by_voting_power_desc_and_slice(
            num_winners, right_arr_len, right_arr
        );
        let (result_arr: ProposalInfo*) = alloc();

        // Step 5. Merge left and right, slice array
        let (sorted_sliced_proposal_arr) = _merge_and_slice(
            num_winners,
            left_arr_len,
            sorted_left_arr,
            right_arr_len,
            sorted_right_arr,
            result_arr,
            0,
            0,
            0,
        );
        return (sorted_sliced_proposal_arr,);
    }

    // Merge left and right arrays, slicing the array to contain no more than `max_sorted_arr_len` proposals by descending voting power.
    func _merge_and_slice{range_check_ptr}(
        max_sorted_arr_len: felt,
        left_arr_len: felt,
        left_arr: ProposalInfo*,
        right_arr_len: felt,
        right_arr: ProposalInfo*,
        sorted_arr: ProposalInfo*,
        current_index: felt,
        left_arr_index: felt,
        right_arr_index: felt,
    ) -> (sorted_arr: ProposalInfo*) {
        alloc_locals;

        if ((current_index) == (left_arr_len + right_arr_len)) {
            return (sorted_arr,);
        }

        // Exit early if the max length has been reached
        if ((current_index) == (max_sorted_arr_len)) {
            return (sorted_arr,);
        }

        if (left_arr_len == left_arr_index) {
            let right_v = right_arr[right_arr_index].voting_power;
            assert sorted_arr[current_index] = right_arr[right_arr_index];
            return _merge_and_slice(
                max_sorted_arr_len,
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_index + 1,
                left_arr_index,
                right_arr_index + 1,
            );
        }

        if (right_arr_len == right_arr_index) {
            let left_v = left_arr[left_arr_index].voting_power;
            assert sorted_arr[current_index] = left_arr[left_arr_index];
            return _merge_and_slice(
                max_sorted_arr_len,
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_index + 1,
                left_arr_index + 1,
                right_arr_index,
            );
        }

        let left_val = left_arr[left_arr_index].voting_power;
        let right_val = right_arr[right_arr_index].voting_power;
        let (is_left) = uint256_le(right_val, left_val);

        if (is_left == TRUE) {
            assert sorted_arr[current_index] = left_arr[left_arr_index];
            return _merge_and_slice(
                max_sorted_arr_len,
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_index + 1,
                left_arr_index + 1,
                right_arr_index,
            );
        } else {
            assert sorted_arr[current_index] = right_arr[right_arr_index];
            return _merge_and_slice(
                max_sorted_arr_len,
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_index + 1,
                left_arr_index,
                right_arr_index + 1,
            );
        }
    }
}
