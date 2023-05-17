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
struct Strategy {
    address: ContractAddress,
    params: Span<felt252>,
}

impl StrategyStorageAccess of StorageAccess<Strategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Strategy> {
        let address = StorageAccessContractAddress::read(address_domain, base)?;

        let param_length_base = storage_address_from_base_and_offset(base, 1);
        let param_length = storage_read_syscall(address_domain, param_length_base)?
            .try_into()
            .unwrap();

        let mut i = 0;
        let mut params = ArrayTrait::new();
        loop {
            if i == param_length {
                break Result::Ok(Strategy { address, params: params.span() });
            }
            let param_base = storage_address_from_base_and_offset(base, i + 2);
            params.append(storage_read_syscall(address_domain, param_base)?);

            i += 1;
        }
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Strategy
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
trait IStrategyRegistry {
    fn get_strategy(strategy_id: felt252) -> Strategy;
    fn register_strategy_if_not_exists(strategy: Strategy) -> felt252;
}

#[contract]
mod StrategyRegistry {
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::{ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::utils::array::{ArrayTraitExt, compute_hash_on_elements};
    use prop_house::common::utils::serde::SpanSerde;
    use super::{IStrategyRegistry, Strategy};
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _strategies: LegacyMap<felt252, Strategy>, 
    }

    #[event]
    fn StrategyRegistered(strategy_id: felt252, strategy: Strategy) {}

    impl StrategyRegistry of IStrategyRegistry {
        fn get_strategy(strategy_id: felt252) -> Strategy {
            let strategy = _strategies::read(strategy_id);
            assert(strategy.address.is_non_zero(), 'VSR: Strategy does not exist');

            strategy
        }

        fn register_strategy_if_not_exists(mut strategy: Strategy) -> felt252 {
            let strategy_id = _compute_strategy_id(ref strategy);

            let stored_strategy = _strategies::read(strategy_id);
            if stored_strategy.address.is_zero() {
                _strategies::write(strategy_id, strategy);
                StrategyRegistered(strategy_id, strategy);
            }
            strategy_id
        }
    }

    /// Returns the  strategy for the given strategy id.
    /// * `strategy_id` - The strategy id.
    #[view]
    fn get_strategy(strategy_id: felt252) -> Strategy {
        StrategyRegistry::get_strategy(strategy_id)
    }

    /// Registers the given  strategy if it does not exist.
    /// * `strategy` - The  strategy.
    #[external]
    fn register_strategy_if_not_exists(strategy: Strategy) -> felt252 {
        StrategyRegistry::register_strategy_if_not_exists(strategy)
    }

    ///
    /// Internals
    ///

    /// Computes the strategy id for the given  strategy.
    /// * `strategy` - The  strategy.
    fn _compute_strategy_id(ref strategy: Strategy) -> felt252 {
        let mut strategy_array = ArrayTrait::new();
        strategy_array.append(strategy.address.into());

        loop {
            match strategy.params.pop_front() {
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
