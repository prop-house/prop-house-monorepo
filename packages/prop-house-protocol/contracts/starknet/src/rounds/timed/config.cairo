use starknet::{
    StorageAccess, SyscallResult, StorageBaseAddress, storage_read_syscall, storage_write_syscall,
    storage_address_from_base_and_offset
};
use prop_house::common::utils::constants::{
    TWO_POW_8, TWO_POW_24, TWO_POW_88, TWO_POW_152, MASK_8, MASK_16, MASK_64
};
use prop_house::common::utils::integer::{U256TryIntoU64, U256TryIntoU16, U256TryIntoU8};
use integer::{
    U128IntoFelt252, Felt252IntoU256, Felt252TryIntoU64, U256TryIntoFelt252, u256_from_felt252
};
use traits::{TryInto, Into};
use option::OptionTrait;
use array::ArrayTrait;

#[derive(Copy, Drop, Serde)]
struct RoundConfig {
    round_state: u8,
    winner_count: u16,
    proposal_period_start_timestamp: u64,
    proposal_period_end_timestamp: u64,
    vote_period_end_timestamp: u64,
    proposal_threshold: felt252,
    award_hash: felt252,
}

/// Pack the provided round config fields into a single felt252.
/// * `round_state` - The round state.
/// * `winner_count` - The number of winners.
/// * `proposal_period_start_timestamp` - The proposal period start timestamp.
/// * `proposal_period_end_timestamp` - The proposal period end timestamp.
/// * `vote_period_end_timestamp` - The vote period end timestamp.
fn pack_round_config_fields(
    round_state: u8,
    winner_count: u16,
    proposal_period_start_timestamp: u64,
    proposal_period_end_timestamp: u64,
    vote_period_end_timestamp: u64,
) -> felt252 {
    let mut packed = 0;
    packed = packed | u256_from_felt252(round_state.into());
    packed = packed | (u256_from_felt252(winner_count.into()) * TWO_POW_8);
    packed = packed | (u256_from_felt252(proposal_period_start_timestamp.into()) * TWO_POW_24);
    packed = packed | (u256_from_felt252(proposal_period_end_timestamp.into()) * TWO_POW_88);
    packed = packed | (u256_from_felt252(vote_period_end_timestamp.into()) * TWO_POW_152);

    packed.try_into().unwrap()
}

/// Unpack the round config fields from a single felt252.
/// * `packed` - The packed fields.
fn unpack_round_config_fields(packed: felt252) -> (u8, u16, u64, u64, u64) {
    let packed = packed.into();

    let round_state: u8 = (packed & MASK_8).try_into().unwrap();
    let winner_count: u16 = ((packed / TWO_POW_8) & MASK_16).try_into().unwrap();
    let proposal_period_start_timestamp: u64 = ((packed / TWO_POW_24) & MASK_64)
        .try_into()
        .unwrap();
    let proposal_period_end_timestamp: u64 = ((packed / TWO_POW_88) & MASK_64).try_into().unwrap();
    let vote_period_end_timestamp: u64 = ((packed / TWO_POW_152) & MASK_64).try_into().unwrap();

    (
        round_state,
        winner_count,
        proposal_period_start_timestamp,
        proposal_period_end_timestamp,
        vote_period_end_timestamp
    )
}

// Storage packing is currently blocked by https://github.com/starkware-libs/cairo/issues/3153.
impl RoundConfigStorageAccess of StorageAccess<RoundConfig> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<RoundConfig> {
        let round_state = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0)
        )?
            .try_into()
            .unwrap();
        let winner_count = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 1)
        )?
            .try_into()
            .unwrap();
        let proposal_period_start_timestamp = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 2)
        )?
            .try_into()
            .unwrap();
        let proposal_period_end_timestamp = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 3)
        )?
            .try_into()
            .unwrap();
        let vote_period_end_timestamp = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 4)
        )?
            .try_into()
            .unwrap();
        let proposal_threshold = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 5)
        )?;
        let award_hash = storage_read_syscall(
            address_domain, storage_address_from_base_and_offset(base, 6)
        )?;
        Result::Ok(
            RoundConfig {
                round_state,
                winner_count,
                proposal_period_start_timestamp,
                proposal_period_end_timestamp,
                vote_period_end_timestamp,
                proposal_threshold,
                award_hash
            }
        )
    }
    #[inline(always)]
    fn write(
        address_domain: u32, base: StorageBaseAddress, value: RoundConfig
    ) -> SyscallResult<()> {
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0), value.round_state.into()
        )?;
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 1), value.winner_count.into()
        )?;
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 2),
            value.proposal_period_start_timestamp.into()
        )?;
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 3),
            value.proposal_period_end_timestamp.into()
        )?;
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 4),
            value.vote_period_end_timestamp.into()
        )?;
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 5), value.proposal_threshold
        )?;
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 6), value.award_hash
        )
    }
}
