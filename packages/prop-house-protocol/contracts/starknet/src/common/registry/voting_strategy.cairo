use core::result::ResultTrait;
use starknet::{StorageAccess, SyscallResult, StorageBaseAddress};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::{ContractAddressIntoFelt252, ContractAddress};
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use option::OptionTrait;
use integer::downcast;

#[derive(Copy, Drop, Serde)]
struct VotingStrategy {
    address: ContractAddress,
    params: Span<felt252>,
}

/// Read an array of parameters from storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
fn read_params(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8
) -> SyscallResult<Span<felt252>> {
    let length = StorageAccess::<u32>::read_at_offset_internal(address_domain, base, offset)?;
    let exit_at = downcast(length).unwrap() + offset;

    let mut params = Default::<Array<felt252>>::default();
    loop {
        if offset == exit_at {
            break Result::Ok(params.span());
        }
        offset += 1;
        let param = StorageAccess::<felt252>::read_at_offset_internal(address_domain, base, offset)?;

        params.append(param);
    }
}

/// Write an array of parameters to storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
/// * `params` - The parameters.
fn write_params(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut params: Span<felt252>
) -> SyscallResult<()> {
    StorageAccess::<u32>::write_at_offset_internal(address_domain, base, offset, params.len())?;

    loop {
        match params.pop_front() {
            Option::Some(v) => {
                offset += 1;
                StorageAccess::<felt252>::write_at_offset_internal(
                    address_domain, base, offset, *v
                )?;
            },
            Option::None(_) => {
                break Result::Ok(());
            },
        };
    }
}

impl VotingStrategyStorageAccess of StorageAccess<VotingStrategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<VotingStrategy> {
        VotingStrategyStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: VotingStrategy
    ) -> SyscallResult<()> {
        VotingStrategyStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<VotingStrategy> {
        let address = StorageAccess::<ContractAddress>::read_at_offset_internal(
            address_domain, base, offset
        )?;
        let mut params = read_params(address_domain, base, offset + 1)?;

        Result::Ok(VotingStrategy { address, params })
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: VotingStrategy
    ) -> SyscallResult<()> {
        StorageAccess::<ContractAddress>::write_at_offset_internal(
            address_domain, base, offset, value.address
        )?;
        write_params(address_domain, base, offset + 1, value.params)
    }
    #[inline(always)]
    fn size_internal(value: VotingStrategy) -> u8 {
        2 + downcast(value.params.len()).unwrap()
    }
}

#[abi]
trait IVotingStrategyRegistry {
    fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy;
    fn register_voting_strategy_if_not_exists(voting_strategy: VotingStrategy) -> felt252;
}

#[contract]
mod VotingStrategyRegistry {
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::{ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::utils::array::{ArrayTraitExt, compute_hash_on_elements};
    use prop_house::common::utils::serde::SpanSerde;
    use super::{IVotingStrategyRegistry, VotingStrategy};
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _voting_strategies: LegacyMap<felt252, VotingStrategy>, 
    }

    #[event]
    fn VotingStrategyRegistered(strategy_id: felt252, strategy: VotingStrategy) {}

    impl VotingStrategyRegistry of IVotingStrategyRegistry {
        fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy {
            let voting_strategy = _voting_strategies::read(strategy_id);
            assert(voting_strategy.address.is_non_zero(), 'VSR: Strategy does not exist');

            voting_strategy
        }

        fn register_voting_strategy_if_not_exists(mut voting_strategy: VotingStrategy) -> felt252 {
            // The maximum parameter length is bound by the maximum storage offset.
            assert(voting_strategy.params.len() <= 254, 'VSR: Too many parameters');

            let strategy_id = _compute_strategy_id(@voting_strategy);

            let stored_strategy = _voting_strategies::read(strategy_id);
            if stored_strategy.address.is_zero() {
                _voting_strategies::write(strategy_id, voting_strategy);
                VotingStrategyRegistered(strategy_id, voting_strategy);
            }
            strategy_id
        }
    }

    /// Returns the voting strategy for the given strategy id.
    /// * `strategy_id` - The strategy id.
    #[view]
    fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy {
        VotingStrategyRegistry::get_voting_strategy(strategy_id)
    }

    /// Registers the given voting strategy if it does not exist.
    /// * `voting_strategy` - The voting strategy.
    #[external]
    fn register_voting_strategy_if_not_exists(voting_strategy: VotingStrategy) -> felt252 {
        VotingStrategyRegistry::register_voting_strategy_if_not_exists(voting_strategy)
    }

    ///
    /// Internals
    ///

    /// Computes the strategy id for the given voting strategy.
    /// * `voting_strategy` - The voting strategy.
    fn _compute_strategy_id(voting_strategy: @VotingStrategy) -> felt252 {
        let mut voting_strategy = *voting_strategy;

        let mut strategy_array = Default::default();
        strategy_array.append(voting_strategy.address.into());

        loop {
            match voting_strategy.params.pop_front() {
                Option::Some(v) => {
                    strategy_array.append(*v);
                },
                Option::None(_) => {
                    break ();
                },
            };
        };
        compute_hash_on_elements(@strategy_array)
    }
}
