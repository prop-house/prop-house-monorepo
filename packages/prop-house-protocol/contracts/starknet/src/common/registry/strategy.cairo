use core::result::ResultTrait;
use starknet::{StorageAccess, SyscallResult, StorageBaseAddress};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::{ContractAddressIntoFelt252, ContractAddress};
use prop_house::common::utils::storage::SpanStorageAccess;
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use option::OptionTrait;
use integer::downcast;

#[derive(Copy, Drop, Serde)]
struct Strategy {
    address: ContractAddress,
    params: Span<felt252>,
}

impl StrategyStorageAccess of StorageAccess<Strategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Strategy> {
        StrategyStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Strategy
    ) -> SyscallResult<()> {
        StrategyStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<Strategy> {
        let address = StorageAccess::<ContractAddress>::read_at_offset_internal(
            address_domain, base, offset
        )?;
        let mut params = SpanStorageAccess::read_at_offset_internal(
            address_domain, base, offset + 1
        )?;
        Result::Ok(Strategy { address, params })
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: Strategy
    ) -> SyscallResult<()> {
        StorageAccess::<ContractAddress>::write_at_offset_internal(
            address_domain, base, offset, value.address
        )?;
        SpanStorageAccess::write_at_offset_internal(address_domain, base, offset + 1, value.params)
    }
    #[inline(always)]
    fn size_internal(value: Strategy) -> u8 {
        1 + SpanStorageAccess::size_internal(value.params)
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
    use prop_house::common::utils::hash::compute_hash_on_elements;
    use prop_house::common::utils::array::ArrayTraitExt;
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
            // The maximum parameter length is bound by the maximum storage offset.
            assert(strategy.params.len() <= 254, 'VSR: Too many parameters');

            let strategy_id = _compute_strategy_id(@strategy);

            let stored_strategy = _strategies::read(strategy_id);
            if stored_strategy.address.is_zero() {
                _strategies::write(strategy_id, strategy);
                StrategyRegistered(strategy_id, strategy);
            }
            strategy_id
        }
    }

    /// Returns the strategy for the given strategy id.
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

    /// Computes the strategy id for the given strategy.
    /// * `strategy` - The strategy.
    fn _compute_strategy_id(strategy: @Strategy) -> felt252 {
        let mut strategy = *strategy;

        let mut strategy_array = Default::default();
        strategy_array.append(strategy.address.into());

        loop {
            match strategy.params.pop_front() {
                Option::Some(v) => {
                    strategy_array.append(*v);
                },
                Option::None(_) => {
                    break;
                },
            };
        };
        compute_hash_on_elements(strategy_array.span())
    }
}
