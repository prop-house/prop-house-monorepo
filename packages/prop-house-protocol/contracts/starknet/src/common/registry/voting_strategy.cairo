use starknet::{
    StorageAccess, SyscallResult, StorageBaseAddress, storage_read_syscall, storage_write_syscall,
    storage_address_from_base_and_offset
};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::{ContractAddressIntoFelt252, ContractAddress};
use starknet::storage_access::StorageAccessContractAddress;
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use option::OptionTrait;

#[derive(Copy, Drop, Serde)]
struct VotingStrategy {
    address: ContractAddress,
    params: Span<felt252>,
}

impl VotingStrategyStorageAccess of StorageAccess<VotingStrategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<VotingStrategy> {
        let address = StorageAccessContractAddress::read(address_domain, base)?;

        let param_length_base = storage_address_from_base_and_offset(base, 1);
        let param_length = storage_read_syscall(address_domain, param_length_base)?
            .try_into()
            .unwrap();

        let mut i = 0;

        let mut params = ArrayTrait::new();
        loop {
            if i == param_length {
                break Result::Ok(VotingStrategy { address, params: params.span() });
            }
            let param_base = storage_address_from_base_and_offset(base, i + 2);
            params.append(storage_read_syscall(address_domain, param_base)?);

            i += 1;
        }
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: VotingStrategy
    ) -> SyscallResult<()> {
        StorageAccessContractAddress::write(address_domain, base, value.address)?;

        let mut offset = 1;
        loop {
            match value.params.pop_front() {
                Option::Some(v) => {
                    starknet::storage_write_syscall(
                        address_domain,
                        starknet::storage_address_from_base_and_offset(base, offset),
                        *v
                    );
                    offset += 1;
                },
                Option::None(_) => {
                    break Result::Ok(());
                },
            };
        }
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
        compute_hash_on_elements(@strategy_array)
    }
}
