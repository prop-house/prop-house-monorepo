use starknet::{StorageAccess, SyscallResult, StorageBaseAddress};
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

#[derive(Copy, Drop, Serde, PartialEq)]
enum RoundState {
    /// The round is active. It has not been cancelled or finalized.
    Active: (),
    /// The round has been cancelled. No more proposals or votes can be submitted. It cannot be finalized.
    Cancelled: (),
    /// The round has been finalized. No more proposals or votes can be submitted.
    Finalized: (),
}

impl RoundStateIntoFelt252 of Into<RoundState, felt252> {
    fn into(self: RoundState) -> felt252 {
        match self {
            RoundState::Active(()) => 0,
            RoundState::Cancelled(()) => 1,
            RoundState::Finalized(()) => 2,
        }
    }
}

impl U256TryIntoRoundState of TryInto<u256, RoundState> {
    // Note that `match` is less clean due to its limited support.
    fn try_into(self: u256) -> Option<RoundState> {
        if self == 0 {
            return Option::Some(RoundState::Active(()));
        }
        if self == 1 {
            return Option::Some(RoundState::Cancelled(()));
        }
        if self == 2 {
            return Option::Some(RoundState::Finalized(()));
        }
        Option::None(())
    }
}

#[derive(Copy, Drop, Serde)]
struct RoundConfig {
    round_state: RoundState,
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
    round_state: RoundState,
    winner_count: u16,
    proposal_period_start_timestamp: u64,
    proposal_period_end_timestamp: u64,
    vote_period_end_timestamp: u64,
) -> felt252 {
    let mut packed = u256_from_felt252(round_state.into());
    packed = packed | (u256_from_felt252(winner_count.into()) * TWO_POW_8);
    packed = packed | (u256_from_felt252(proposal_period_start_timestamp.into()) * TWO_POW_24);
    packed = packed | (u256_from_felt252(proposal_period_end_timestamp.into()) * TWO_POW_88);
    packed = packed | (u256_from_felt252(vote_period_end_timestamp.into()) * TWO_POW_152);

    packed.try_into().unwrap()
}

/// Unpack the round config fields from a single felt252.
/// * `packed` - The packed fields.
fn unpack_round_config_fields(packed: felt252) -> (RoundState, u16, u64, u64, u64) {
    let packed = packed.into();

    let round_state: RoundState = (packed & MASK_8).try_into().unwrap();
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

impl RoundConfigStorageAccess of StorageAccess<RoundConfig> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<RoundConfig> {
        RoundConfigStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, value: RoundConfig
    ) -> SyscallResult<()> {
        RoundConfigStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<RoundConfig> {
        let (
            round_state,
            winner_count,
            proposal_period_start_timestamp,
            proposal_period_end_timestamp,
            vote_period_end_timestamp
        ) = unpack_round_config_fields(
            StorageAccess::<felt252>::read_at_offset_internal(address_domain, base, offset)?
        );
        let proposal_threshold = StorageAccess::<felt252>::read_at_offset_internal(
            address_domain, base, offset + 1
        )?;
        let award_hash = StorageAccess::<felt252>::read_at_offset_internal(
            address_domain, base, offset + 2
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
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: RoundConfig
    ) -> SyscallResult<()> {
        let packed = pack_round_config_fields(
            value.round_state,
            value.winner_count,
            value.proposal_period_start_timestamp,
            value.proposal_period_end_timestamp,
            value.vote_period_end_timestamp
        );
        StorageAccess::<felt252>::write_at_offset_internal(address_domain, base, offset, packed)?;
        StorageAccess::<felt252>::write_at_offset_internal(
            address_domain, base, offset + 1, value.proposal_threshold
        )?;
        StorageAccess::<felt252>::write_at_offset_internal(
            address_domain, base, offset + 2, value.award_hash
        )
    }
    #[inline(always)]
    fn size_internal(value: RoundConfig) -> u8 {
        2
    }
}
