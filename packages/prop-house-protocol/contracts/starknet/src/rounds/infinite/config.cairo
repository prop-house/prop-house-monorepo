use starknet::{
    EthAddress, Store, SyscallResult, StorageBaseAddress, storage_read_syscall,
    storage_write_syscall, storage_address_from_base_and_offset
};
use prop_house::common::utils::constants::{
    TWO_POW_8, TWO_POW_72, TWO_POW_168, TWO_POW_232, MASK_8, MASK_16, MASK_64, MASK_160,
};
use prop_house::common::utils::integer::{U256TryIntoU8, U256TryIntoEthAddress};
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::common::registry::strategy::Strategy;
use integer::{
    U128IntoFelt252, Felt252IntoU256, Felt252TryIntoU64, U256TryIntoFelt252, u256_from_felt252
};
use traits::{TryInto, Into};
use option::OptionTrait;
use array::ArrayTrait;

#[starknet::interface]
trait IInfiniteRound<TContractState> {
    fn get_proposal(self: @TContractState, proposal_id: u32) -> Proposal;
    fn propose(
        ref self: TContractState, 
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn edit_proposal(ref self: TContractState, proposer: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>, requested_assets: Array<Asset>);
    fn cancel_proposal(ref self: TContractState, proposer: EthAddress, proposal_id: u32);
    fn vote(
        ref self: TContractState,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
    fn process_winners(ref self: TContractState);
    fn cancel_round(ref self: TContractState);
    fn finalize_round(ref self: TContractState);
}

struct RoundParams {
    start_timestamp: u64,
    vote_period: u64,
    quorum_for: felt252,
    quorum_against: felt252,
    proposal_threshold: felt252,
    proposing_strategies: Span<Strategy>,
    voting_strategies: Span<Strategy>,
}

#[derive(Copy, Drop, Serde)]
enum VoteDirection {
    Against: (),
    For: (),
}

impl VoteDirectionIntoU256 of Into<VoteDirection, u256> {
    fn into(self: VoteDirection) -> u256 {
        match self {
            VoteDirection::Against(()) => 0,
            VoteDirection::For(()) => 1,
        }
    }
}

#[derive(Copy, Drop, Serde)]
struct ProposalVote {
    proposal_id: u32,
    proposal_version: u16,
    voting_power: u256,
    direction: VoteDirection
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

#[derive(Copy, Drop, Serde, PartialEq)]
enum ProposalState {
    Active: (),
    Stale: (),
    Cancelled: (),
    Rejected: (),
    Approved: (),
}

#[derive(Copy, Drop, Serde)]
struct Proposal {
    state: ProposalState,
    proposer: EthAddress,
    received_at: u64,
    version: u16,
    requested_assets_hash: felt252,
    voting_power_for: u256,
    voting_power_against: u256,
}

impl ProposalStateIntoFelt252 of Into<ProposalState, u256> {
    fn into(self: ProposalState) -> u256 {
        match self {
            ProposalState::Active(()) => 0,
            ProposalState::Stale(()) => 1,
            ProposalState::Cancelled(()) => 2,
            ProposalState::Rejected(()) => 3,
            ProposalState::Approved(()) => 4,
        }
    }
}

impl U256TryIntoProposalState of TryInto<u256, ProposalState> {
    // Note that `match` is less clean due to its limited support.
    fn try_into(self: u256) -> Option<ProposalState> {
        if self == 0 {
            return Option::Some(ProposalState::Active(()));
        }
        if self == 1 {
            return Option::Some(ProposalState::Stale(()));
        }
        if self == 2 {
            return Option::Some(ProposalState::Cancelled(()));
        }
        if self == 3 {
            return Option::Some(ProposalState::Rejected(()));
        }
        if self == 4 {
            return Option::Some(ProposalState::Approved(()));
        }
        Option::None(())
    }
}

/// Pack the proposal fields into a single felt252.
/// * `state` - The state of the proposal.
/// * `proposer` - The proposer of the proposal.
/// * `received_at` - The time the proposal was received.
/// * `version` - The version of the proposal (incremented every edit).
fn pack_proposal_fields(state: ProposalState, proposer: EthAddress, received_at: u64, version: u16) -> felt252 {
    let mut packed: u256 = state.into();
    packed = packed | (u256_from_felt252(proposer.into()) * TWO_POW_8);
    packed = packed | (u256_from_felt252(received_at.into()) * TWO_POW_168);
    packed = packed | (u256_from_felt252(version.into()) * TWO_POW_232);

    packed.try_into().unwrap()
}

/// Unpack the proposal fields from a single felt252.
/// * `packed` - The packed proposal.
fn unpack_proposal_fields(packed: felt252) -> (ProposalState, EthAddress, u64, u16) {
    let packed: u256 = packed.into();
    let state: ProposalState = (packed & MASK_8).try_into().unwrap();
    let proposer: EthAddress = ((packed / TWO_POW_8) & MASK_160).try_into().unwrap();
    let received_at: u64 = ((packed / TWO_POW_168) & MASK_64).try_into().unwrap();
    let version: u16 = ((packed / TWO_POW_232) & MASK_16).try_into().unwrap();

    (state, proposer, received_at, version)
}

impl ProposalStore of Store<Proposal> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Proposal> {
        ProposalStore::read_at_offset(address_domain, base, 0)
    }
    fn write(address_domain: u32, base: StorageBaseAddress, value: Proposal) -> SyscallResult<()> {
        ProposalStore::write_at_offset(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<Proposal> {
        let (state, proposer, received_at, version) = unpack_proposal_fields(
            Store::<felt252>::read_at_offset(address_domain, base, offset)?
        );
        let requested_assets_hash = Store::<felt252>::read_at_offset(
            address_domain, base, offset + 1
        )?;
        let voting_power_for = Store::<u256>::read_at_offset(
            address_domain, base, offset + 2
        )?;
        let voting_power_against = Store::<u256>::read_at_offset(
            address_domain, base, offset + 2 + Store::<u256>::size(),
        )?;
        Result::Ok(Proposal { state, proposer, received_at, version, requested_assets_hash, voting_power_for, voting_power_against })
    }
    #[inline(always)]
    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: Proposal
    ) -> SyscallResult<()> {
        let packed = pack_proposal_fields(
            value.state, value.proposer, value.received_at, value.version
        );
        Store::<felt252>::write_at_offset(address_domain, base, offset, packed)?;
        Store::<felt252>::write_at_offset(
            address_domain, base, offset + 1, value.requested_assets_hash,
        )?;
        Store::<u256>::write_at_offset(
            address_domain, base, offset + 2, value.voting_power_for,
        )?;
        Store::<u256>::write_at_offset(
            address_domain, base, offset + 2 + Store::<u256>::size(),
            value.voting_power_against,
        )
    }
    #[inline(always)]
    fn size() -> u8 {
        2 + Store::<u256>::size() + Store::<u256>::size()
    }
}

#[derive(Copy, Drop, Serde)]
struct RoundConfig {
    round_state: RoundState,
    start_timestamp: u64,
    vote_period: u64,
    proposal_threshold: felt252,
    quorum_for: felt252,
    quorum_against: felt252,
}

/// Pack the provided round config fields into a single felt252.
/// * `round_state` - The round state.
/// * `start_timestamp` - The start timestamp (Round starts automatically if < current_timestamp).
/// * `vote_period` - The amount of time (in seconds) to vote once a proposal is received.
fn pack_round_config_fields(round_state: RoundState, start_timestamp: u64, vote_period: u64) -> felt252 {
    let mut packed = u256_from_felt252(round_state.into());
    packed = packed | (u256_from_felt252(start_timestamp.into()) * TWO_POW_8);
    packed = packed | (u256_from_felt252(vote_period.into()) * TWO_POW_72);

    packed.try_into().unwrap()
}

/// Unpack the round config fields from a single felt252.
/// * `packed` - The packed fields.
fn unpack_round_config_fields(packed: felt252) -> (RoundState, u64, u64) {
    let packed = packed.into();

    let round_state: RoundState = (packed & MASK_8).try_into().unwrap();
    let start_timestamp: u64 = ((packed / TWO_POW_8) & MASK_64).try_into().unwrap();
    let vote_period: u64 = ((packed / TWO_POW_72) & MASK_64).try_into().unwrap();

    (
        round_state, start_timestamp, vote_period
    )
}

impl RoundConfigStore of Store<RoundConfig> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<RoundConfig> {
        RoundConfigStore::read_at_offset(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, value: RoundConfig
    ) -> SyscallResult<()> {
        RoundConfigStore::write_at_offset(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<RoundConfig> {
        let (
            round_state,
            start_timestamp,
            vote_period
        ) = unpack_round_config_fields(
            Store::<felt252>::read_at_offset(address_domain, base, offset)?
        );
        let proposal_threshold = Store::<felt252>::read_at_offset(
            address_domain, base, offset + 1
        )?;
        let quorum_for = Store::<felt252>::read_at_offset(
            address_domain, base, offset + 2
        )?;
        let quorum_against = Store::<felt252>::read_at_offset(
            address_domain, base, offset + 3
        )?;
        Result::Ok(
            RoundConfig {
                round_state,
                start_timestamp,
                vote_period,
                proposal_threshold,
                quorum_for,
                quorum_against
            }
        )
    }
    #[inline(always)]
    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: RoundConfig
    ) -> SyscallResult<()> {
        let packed = pack_round_config_fields(
            value.round_state, value.start_timestamp, value.vote_period
        );
        Store::<felt252>::write_at_offset(address_domain, base, offset, packed)?;
        Store::<felt252>::write_at_offset(
            address_domain, base, offset + 1, value.proposal_threshold
        )?;
        Store::<felt252>::write_at_offset(
            address_domain, base, offset + 2, value.quorum_for
        )?;
        Store::<felt252>::write_at_offset(
            address_domain, base, offset + 3, value.quorum_against
        )
    }
    #[inline(always)]
    fn size() -> u8 {
        4
    }
}
