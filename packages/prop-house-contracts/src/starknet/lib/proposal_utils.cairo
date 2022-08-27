from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.bool import TRUE
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math_cmp import is_le
from starkware.cairo.common.uint256 import uint256_le

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

        let (sorted_proposals_ptr) = sort_by_voting_power_desc(num_submissions, submissions_ptr)

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

    # Sort an array of proposal info by descending voting power.
    func sort_by_voting_power_desc{range_check_ptr}(
        num_submissions : felt, submissions_ptr : ProposalInfo*
    ) -> (sorted_submissions_ptr : ProposalInfo*):
        let (submissions_ptr_input : ProposalInfo*) = alloc()
        let (sorted_submissions_ptr) = bubble_sort_by_voting_power_desc(
            num_submissions, submissions_ptr, 0, 1, submissions_ptr_input, 0
        )
        return (sorted_submissions_ptr)
    end

    # Use bubble sort to sort an array of proposal info by descending voting power.
    func bubble_sort_by_voting_power_desc{range_check_ptr}(
        num_submissions : felt,
        submissions_ptr : ProposalInfo*,
        idx1 : felt,
        idx2 : felt,
        sorted_submissions_ptr : ProposalInfo*,
        sorted_this_iteration : felt,
    ) -> (sorted_submissions_ptr : ProposalInfo*):
        alloc_locals
        local submissions_ptr : ProposalInfo* = submissions_ptr
        local range_check_ptr = range_check_ptr

        if idx2 == num_submissions:
            assert [sorted_submissions_ptr + (idx2 - 1) * ProposalInfo.SIZE] = [submissions_ptr + idx1 * ProposalInfo.SIZE]
            if sorted_this_iteration == 0:
                return (sorted_submissions_ptr)
            end

            let (new_sorted_ptr : ProposalInfo*) = alloc()
            let (recursive_sorted_ptr) = bubble_sort_by_voting_power_desc(
                num_submissions, sorted_submissions_ptr, 0, 1, new_sorted_ptr, 0
            )
            return (recursive_sorted_ptr)
        end
        let (is_ordered) = uint256_le(
            [submissions_ptr + idx2 * ProposalInfo.SIZE].voting_power,
            [submissions_ptr + idx1 * ProposalInfo.SIZE].voting_power,
        )
        if is_ordered == TRUE:
            assert [sorted_submissions_ptr + (idx2 - 1) * ProposalInfo.SIZE] = [submissions_ptr + idx1 * ProposalInfo.SIZE]
            let (recursive_sorted_ptr) = bubble_sort_by_voting_power_desc(
                num_submissions,
                submissions_ptr,
                idx2,
                idx2 + 1,
                sorted_submissions_ptr,
                sorted_this_iteration,
            )
            return (recursive_sorted_ptr)
        end
        assert [sorted_submissions_ptr + (idx2 - 1) * ProposalInfo.SIZE] = [submissions_ptr + idx2 * ProposalInfo.SIZE]
        let (recursive_sorted_ptr) = bubble_sort_by_voting_power_desc(
            num_submissions, submissions_ptr, idx1, idx2 + 1, sorted_submissions_ptr, 1
        )
        return (recursive_sorted_ptr)
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
