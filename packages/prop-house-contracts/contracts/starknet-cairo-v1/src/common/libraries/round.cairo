use starknet::{
    StorageAccess, SyscallResult, StorageBaseAddress, storage_read_syscall, storage_write_syscall,
    storage_address_from_base_and_offset
};
use prop_house::common::utils::bool::{BoolIntoFelt252, Felt252TryIntoBool};
use integer::{U128IntoFelt252, Felt252IntoU256, Felt252TryIntoU64};
use traits::{TryInto, Into};
use option::OptionTrait;
use array::ArrayTrait;

#[derive(Copy, Drop, Serde)]
struct Proposal {
    proposer: felt252,
    is_cancelled: bool,
    last_updated_at: u64,
    voting_power: u256,
}

#[derive(Copy, Drop, Serde)]
struct ProposalWithId {
    proposal_id: u32,
    proposal: Proposal,
}

impl ProposalStorageAccess of StorageAccess<Proposal> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Proposal> {
        let proposer_base = storage_address_from_base_and_offset(base, 0);
        let proposer = storage_read_syscall(address_domain, proposer_base)?;

        let is_cancelled_base = storage_address_from_base_and_offset(base, 1);
        let is_cancelled = storage_read_syscall(
            address_domain, is_cancelled_base
        )?.try_into().unwrap();

        let last_updated_at_base = storage_address_from_base_and_offset(base, 2);
        let last_updated_at = storage_read_syscall(
            address_domain, last_updated_at_base
        )?.try_into().unwrap();

        let voting_power_base = storage_address_from_base_and_offset(base, 3);
        let voting_power = storage_read_syscall(address_domain, voting_power_base)?.into();

        Result::Ok(Proposal { proposer, is_cancelled, last_updated_at, voting_power })
    }

    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        let proposer_base = storage_address_from_base_and_offset(base, 0);
        storage_write_syscall(address_domain, proposer_base, value.proposer)?;

        let is_cancelled_base = storage_address_from_base_and_offset(base, 1);
        storage_write_syscall(address_domain, is_cancelled_base, value.is_cancelled.into())?;

        let last_updated_at_base = storage_address_from_base_and_offset(base, 2);
        storage_write_syscall(address_domain, last_updated_at_base, value.last_updated_at.into())?;

        let voting_power_base_low = storage_address_from_base_and_offset(base, 3);
        storage_write_syscall(
            address_domain, voting_power_base_low, value.voting_power.low.into()
        )?;

        let voting_power_base_high = storage_address_from_base_and_offset(base, 4);
        storage_write_syscall(
            address_domain, voting_power_base_high, value.voting_power.high.into()
        )
    }
}

#[contract]
mod Round {
    use super::{Proposal, ProposalWithId};
    use array::{ArrayTrait, SpanTrait};

    struct Storage {
        _proposals: LegacyMap<u32, Proposal>,
        _proposal_count: u32,
    }

    /// Get all active proposals (not cancelled), including proposal IDs.
    fn get_active_proposals() -> Array<ProposalWithId> {
        let mut active_proposals = ArrayTrait::new();

        let mut id = 1;
        let proposal_count = _proposal_count::read();
        loop {
            if id > proposal_count {
                break ();
            }

            let proposal = _proposals::read(id);
            if !proposal.is_cancelled {
                active_proposals.append(ProposalWithId { proposal_id: id, proposal });
            }
            id += 1;
        };
        active_proposals
    }

    /// Get the top N proposals by descending voting power.
    /// * `proposals` - Array of proposals to sort
    /// * `max_return_count` - Max number of proposals to return
    fn get_n_proposals_by_voting_power_desc(
        mut proposals: Array<ProposalWithId>, max_return_count: u32
    ) -> Span<ProposalWithId> {
        _mergesort_proposals_by_voting_power_desc_and_slice(proposals, max_return_count).span()
    }

    /// Return an array of all the proposal IDs in the given array of proposals.
    /// * `proposals` - Array of proposals
    fn extract_proposal_ids(mut proposals: Span<ProposalWithId>) -> Span<u32> {
        let mut proposal_ids = ArrayTrait::<u32>::new();
        loop {
            match proposals.pop_front() {
                Option::Some(p) => {
                    proposal_ids.append(*p.proposal_id);
                },
                Option::None(_) => {
                    break ();
                },
            };
        };
        proposal_ids.span()
    }

    /// Merge sort and slice an array of proposals by descending voting power
    /// * `arr` - Array of proposals to sort
    /// * `max_return_count` - Max return count
    fn _mergesort_proposals_by_voting_power_desc_and_slice(
        mut arr: Array<ProposalWithId>, max_return_count: u32
    ) -> Array<ProposalWithId> {
        let len = arr.len();
        if len <= 1 {
            return arr;
        }

        // Create left and right arrays
        let middle = len / 2;
        let (mut left_arr, mut right_arr) = _split_array(ref arr, middle);

        // Recursively sort the left and right arrays
        let mut sorted_left = _mergesort_proposals_by_voting_power_desc_and_slice(
            left_arr, max_return_count
        );
        let mut sorted_right = _mergesort_proposals_by_voting_power_desc_and_slice(
            right_arr, max_return_count
        );

        let mut result_arr = ArrayTrait::new();
        _merge_and_slice_recursive(
            sorted_left, sorted_right, ref result_arr, 0, 0, max_return_count
        );
        result_arr
    }

    /// Merge two sorted proposal arrays.
    /// * `left_arr` - Left array
    /// * `right_arr` - Right array
    /// * `result_arr` - Result array
    /// * `left_arr_ix` - Left array index
    /// * `right_arr_ix` - Right array index
    /// * `max_return_count` - Max return count
    fn _merge_and_slice_recursive(
        mut left_arr: Array<ProposalWithId>,
        mut right_arr: Array<ProposalWithId>,
        ref result_arr: Array<ProposalWithId>,
        left_arr_ix: usize,
        right_arr_ix: usize,
        max_return_count: u32,
    ) {
        if result_arr.len() == left_arr.len() + right_arr.len() {
            return ();
        }

        // Exit early if the max return count has been reached
        if result_arr.len() == max_return_count {
            return ();
        }

        if left_arr_ix == left_arr.len() {
            result_arr.append(*right_arr[right_arr_ix]);
            return _merge_and_slice_recursive(
                left_arr, right_arr, ref result_arr, left_arr_ix, right_arr_ix + 1, max_return_count
            );
        }

        if right_arr_ix == right_arr.len() {
            result_arr.append(*left_arr[left_arr_ix]);
            return _merge_and_slice_recursive(
                left_arr, right_arr, ref result_arr, left_arr_ix + 1, right_arr_ix, max_return_count
            );
        }

        if *left_arr[left_arr_ix].proposal.voting_power >= *right_arr[right_arr_ix].proposal.voting_power {
            result_arr.append(*left_arr[left_arr_ix]);
            _merge_and_slice_recursive(
                left_arr, right_arr, ref result_arr, left_arr_ix + 1, right_arr_ix, max_return_count
            )
        } else {
            result_arr.append(*right_arr[right_arr_ix]);
            _merge_and_slice_recursive(
                left_arr, right_arr, ref result_arr, left_arr_ix, right_arr_ix + 1, max_return_count
            )
        }
    }

    // Split an array into two arrays.
    /// * `arr` - The array to split.
    /// * `index` - The index to split the array at.
    /// # Returns
    /// * `(Array<T>, Array<T>)` - The two arrays.
    fn _split_array<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
        ref arr: Array<T>, index: usize
    ) -> (Array::<T>, Array::<T>) {
        let mut arr1 = ArrayTrait::new();
        let mut arr2 = ArrayTrait::new();
        let len = arr.len();

        _fill_array(ref arr1, ref arr, 0, index);
        _fill_array(ref arr2, ref arr, index, len - index);

        (arr1, arr2)
    }

    // Fill an array with a value.
    /// * `arr` - The array to fill.
    /// * `fill_arr` - The array to fill with.
    /// * `index` - The index to start filling at.
    /// * `count` - The number of elements to fill.
    /// # Returns
    /// * `Array<T>` - The filled array.
    fn _fill_array<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
        ref arr: Array<T>, ref fill_arr: Array<T>, index: usize, count: usize
    ) {
        if count == 0 {
            return ();
        }

        arr.append(*fill_arr[index]);

        _fill_array(ref arr, ref fill_arr, index + 1, count - 1)
    }
}
