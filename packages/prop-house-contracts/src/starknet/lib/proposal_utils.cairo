from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math_cmp import is_le
from starkware.cairo.common.uint256 import uint256_le
from starkware.cairo.common.math import unsigned_div_rem

from src.starknet.lib.proposal_info import ProposalInfo

namespace ProposalUtils:
    # Given an array of proposal information ordered by ascending proposal ID, return the winning proposals.
    # Winners: `num_winners` proposal(s), ordered by descending voting power.
    # Tie-Breaker: In the event of a tie, the proposal(s) which were received first will win.
    # To accurately make this determination, the provided array MUST be ordered by ascending proposal ID.
    func select_winners{range_check_ptr}(
        num_winners : felt, num_submissions : felt, submissions_ptr : ProposalInfo*
    ) -> (winning_proposals_ptr : ProposalInfo*):
        alloc_locals

        let (sorted_proposals_ptr) = mergesort_by_voting_power_desc(
            num_submissions, submissions_ptr
        )

        # If the number of submissions are less than or equal to the number of winners then everybody wins
        let (submissions_do_not_exceed_winners) = is_le(num_submissions, num_winners)
        if submissions_do_not_exceed_winners == TRUE:
            return (sorted_proposals_ptr)
        end

        let (winning_proposals_ptr : ProposalInfo*) = alloc()
        slice_array(
            0, num_winners, sorted_proposals_ptr, num_submissions, winning_proposals_ptr, 0, 0
        )
        return (winning_proposals_ptr)
    end

    # Sort an array of proposal info by descending voting power using the mergesort algorithm.
    func mergesort_by_voting_power_desc{range_check_ptr}(
        num_submissions : felt, submissions_ptr : ProposalInfo*
    ) -> (sorted_submissions_ptr : ProposalInfo*):
        alloc_locals

        # Step 1. If len == 1 => return array
        if num_submissions == 1:
            return (submissions_ptr)
        end

        # Step 2. Split list at middle
        let (left_arr_len, _) = unsigned_div_rem(num_submissions, 2)
        let right_arr_len = num_submissions - left_arr_len

        # Step 3. Create left and right
        let left_arr = submissions_ptr
        let right_arr = submissions_ptr + left_arr_len * ProposalInfo.SIZE

        # Step 4. Recurse left and right
        let (sorted_left_arr) = mergesort_by_voting_power_desc(left_arr_len, left_arr)
        let (sorted_right_arr) = mergesort_by_voting_power_desc(right_arr_len, right_arr)
        let (result_arr : ProposalInfo*) = alloc()

        # Step 5. Merge left and right
        let (sorted_submissions) = _merge(
            left_arr_len, sorted_left_arr, right_arr_len, sorted_right_arr, result_arr, 0, 0, 0
        )
        return (sorted_submissions)
    end

    # Merge left and right proposal info arrays.
    func _merge{range_check_ptr}(
        left_arr_len : felt,
        left_arr : ProposalInfo*,
        right_arr_len : felt,
        right_arr : ProposalInfo*,
        sorted_arr : ProposalInfo*,
        current_ix : felt,
        left_arr_ix : felt,
        right_arr_ix : felt,
    ) -> (sorted_arr : ProposalInfo*):
        alloc_locals

        if (current_ix) == (left_arr_len + right_arr_len):
            return (sorted_arr)
        end

        if left_arr_len == left_arr_ix:
            let right_v = right_arr[right_arr_ix].voting_power
            assert sorted_arr[current_ix] = right_arr[right_arr_ix]
            return _merge(
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_ix + 1,
                left_arr_ix,
                right_arr_ix + 1,
            )
        end

        if right_arr_len == right_arr_ix:
            let left_v = left_arr[left_arr_ix].voting_power
            assert sorted_arr[current_ix] = left_arr[left_arr_ix]
            return _merge(
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_ix + 1,
                left_arr_ix + 1,
                right_arr_ix,
            )
        end

        let left_val = left_arr[left_arr_ix].voting_power
        let right_val = right_arr[right_arr_ix].voting_power
        let (is_left) = uint256_le(right_val, left_val)

        if is_left == TRUE:
            assert sorted_arr[current_ix] = left_arr[left_arr_ix]
            return _merge(
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_ix + 1,
                left_arr_ix + 1,
                right_arr_ix,
            )
        else:
            assert sorted_arr[current_ix] = right_arr[right_arr_ix]
            return _merge(
                left_arr_len,
                left_arr,
                right_arr_len,
                right_arr,
                sorted_arr,
                current_ix + 1,
                left_arr_ix,
                right_arr_ix + 1,
            )
        end
    end

    # Slice the provided proposal info array, returning the portion of it from `start` to `start + size`.
    func slice_array{range_check_ptr}(
        start : felt,
        size : felt,
        arr : ProposalInfo*,
        arr_len : felt,
        acc : ProposalInfo*,
        acc_len : felt,
        current_index : felt,
    ) -> (offset : felt):
        if current_index == size:
            return (start + current_index)
        end

        assert acc[current_index] = arr[start + current_index]

        return slice_array(start, size, arr, arr_len, acc, acc_len + 1, current_index + 1)
    end
end
