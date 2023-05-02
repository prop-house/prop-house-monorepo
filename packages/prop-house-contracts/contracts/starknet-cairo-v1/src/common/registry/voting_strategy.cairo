use starknet::{
    StorageAccess, SyscallResult, StorageBaseAddress, storage_read_syscall, storage_write_syscall,
    storage_address_from_base_and_offset
};
use starknet::contract_address::Felt252TryIntoContractAddress;
use prop_house::common::utils::storage_access::StorageAccessFelt252Span;
use starknet::{ContractAddressIntoFelt252, ContractAddress};
use traits::{TryInto, Into};
use option::OptionTrait;
use array::ArrayTrait;

#[derive(Copy, Drop, Serde)]
struct VotingStrategy {
    address: ContractAddress,
    params: Span<felt252>,
}

impl VotingStrategyStorageAccess of StorageAccess<VotingStrategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<VotingStrategy> {
        Result::Ok(
            VotingStrategy {
                address: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 0)
                )?.try_into().unwrap(),
                params: StorageAccessFelt252Span::read(address_domain, base)?,
            }
        )
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, value: VotingStrategy
    ) -> SyscallResult<()> {
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0), value.address.into()
        )?;
        StorageAccessFelt252Span::write(address_domain, base, value.params)
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
    use prop_house::common::utils::array::{ArrayTraitExt, array_hash};
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
            let strategy_id = _compute_strategy_id(ref voting_strategy);

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
    fn _compute_strategy_id(ref voting_strategy: VotingStrategy) -> felt252 {
        let mut strategy_array = ArrayTrait::new();
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
        array_hash(@strategy_array)
    }
}
