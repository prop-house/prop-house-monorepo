use starknet::{EthAddress, StorageAccess, SyscallResult, StorageBaseAddress};
use prop_house::common::utils::bool::{BoolIntoFelt252, Felt252TryIntoBool};
use prop_house::common::utils::constants::{
    TWO_POW_8, TWO_POW_24, TWO_POW_88, TWO_POW_152, TWO_POW_160, TWO_POW_224, MASK_8, MASK_16,
    MASK_64, MASK_160,
};
use prop_house::common::utils::integer::{
    U256TryIntoU64, U256TryIntoEthAddress, U256TryIntoU16, U256TryIntoU8,
};
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::common::registry::strategy::Strategy;
use integer::{
    U128IntoFelt252, Felt252IntoU256, Felt252TryIntoU64, U256TryIntoFelt252, u256_from_felt252
};
use traits::{TryInto, Into};
use option::OptionTrait;
use array::ArrayTrait;

#[abi]
trait ITimedRound {
    fn get_proposal(proposal_id: u32) -> Proposal;
    fn propose(
        proposer_address: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn edit_proposal(proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>);
    fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32);
    fn vote(
        voter_address: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
    fn cancel_round();
    fn finalize_round(awards: Array<Asset>);
}

#[derive(Drop)]
struct RoundParams {
    award_hash: felt252,
    proposal_period_start_timestamp: u64,
    proposal_period_duration: u64,
    vote_period_duration: u64,
    winner_count: u16,
    proposal_threshold: felt252,
    proposing_strategies: Span<Strategy>,
    voting_strategies: Span<Strategy>,
}

#[derive(Copy, Drop, Serde)]
struct ProposalVote {
    proposal_id: u32,
    voting_power: u256,
}

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
struct Proposal {
    proposer: EthAddress,
    last_updated_at: u64,
    is_cancelled: bool,
    voting_power: u256,
}

#[derive(Copy, Drop, Serde)]
struct ProposalWithId {
    proposal_id: u32,
    proposal: Proposal,
}

/// Pack the proposal fields into a single felt252.
/// * `proposer` - The proposer of the proposal.
/// * `last_updated_at` - The last time the proposal was updated.
/// * `is_cancelled` - Whether the proposal is cancelled.
fn pack_proposal_fields(proposer: EthAddress, last_updated_at: u64, is_cancelled: bool) -> felt252 {
    let mut packed = proposer.address.into();
    packed = packed | (u256_from_felt252(last_updated_at.into()) * TWO_POW_160);
    packed = packed | (u256_from_felt252(is_cancelled.into()) * TWO_POW_224);

    packed.try_into().unwrap()
}

/// Unpack the proposal fields from a single felt252.
/// * `packed` - The packed proposal.
fn unpack_proposal_fields(packed: felt252) -> (EthAddress, u64, bool) {
    let packed = packed.into();

    let proposer: EthAddress = (packed & MASK_160).try_into().unwrap();
    let last_updated_at: u64 = ((packed / TWO_POW_160) & MASK_64).try_into().unwrap();
    let is_cancelled = packed / TWO_POW_224 != 0;

    (proposer, last_updated_at, is_cancelled)
}

impl ProposalStorageAccess of StorageAccess<Proposal> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Proposal> {
        ProposalStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        ProposalStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<Proposal> {
        let (proposer, last_updated_at, is_cancelled) = unpack_proposal_fields(
            StorageAccess::<felt252>::read_at_offset_internal(address_domain, base, offset)?
        );
        let voting_power = StorageAccess::<u256>::read_at_offset_internal(
            address_domain, base, offset + 1
        )?;
        Result::Ok(Proposal { proposer, is_cancelled, last_updated_at, voting_power })
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: Proposal
    ) -> SyscallResult<()> {
        let packed = pack_proposal_fields(
            value.proposer, value.last_updated_at, value.is_cancelled
        );
        StorageAccess::<felt252>::write_at_offset_internal(address_domain, base, offset, packed)?;
        StorageAccess::<u256>::write_at_offset_internal(
            address_domain, base, offset + 1, value.voting_power
        )
    }
    #[inline(always)]
    fn size_internal(value: Proposal) -> u8 {
        3
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
        3
    }
}
