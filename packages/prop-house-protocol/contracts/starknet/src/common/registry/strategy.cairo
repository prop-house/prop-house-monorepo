use starknet::{Store, SyscallResult, StorageBaseAddress};
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::{ContractAddressIntoFelt252, ContractAddress};
use prop_house::common::utils::storage::SpanStore;
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use option::OptionTrait;

#[derive(Copy, Drop, Serde)]
struct Strategy {
    address: ContractAddress,
    params: Span<felt252>,
}

impl StrategyStore of Store<Strategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Strategy> {
        StrategyStore::read_at_offset(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Strategy
    ) -> SyscallResult<()> {
        StrategyStore::write_at_offset(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<Strategy> {
        let address = Store::<ContractAddress>::read_at_offset(
            address_domain, base, offset
        )?;
        let mut params = SpanStore::read_at_offset(
            address_domain, base, offset + 1
        )?;
        Result::Ok(Strategy { address, params })
    }
    #[inline(always)]
    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: Strategy
    ) -> SyscallResult<()> {
        Store::<ContractAddress>::write_at_offset(
            address_domain, base, offset, value.address
        )?;
        SpanStore::write_at_offset(address_domain, base, offset + 1, value.params)
    }
    #[inline(always)]
    fn size() -> u8 {
        SpanStore::<felt252>::size()
    }
}

#[starknet::interface]
trait IStrategyRegistry<TContractState> {
    fn get_strategy(self: @TContractState, strategy_id: felt252) -> Strategy;
    fn register_strategy_if_not_exists(ref self: TContractState, strategy: Strategy) -> felt252;
}

#[starknet::contract]
mod StrategyRegistry {
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::{ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::utils::array::ArrayTraitExt;
    use super::{IStrategyRegistry, Strategy};
    use array::{ArrayTrait, SpanTrait};
    use poseidon::poseidon_hash_span;
    use zeroable::Zeroable;
    use traits::Into;

    #[storage]
    struct Storage {
        _strategies: LegacyMap<felt252, Strategy>, 
    }

   #[event]
   #[derive(Drop, starknet::Event)]
    enum Event {
        StrategyRegistered: StrategyRegistered,
    }

    /// Emitted when a strategy is registered.
    /// * `strategy_id` - The strategy id.
    /// * `strategy` - The strategy address and parameters.
    #[derive(Drop, starknet::Event)]
    struct StrategyRegistered {
        strategy_id: felt252,
        strategy: Strategy,
    }

    #[external(v0)]
    impl StrategyRegistry of IStrategyRegistry<ContractState> {
        /// Returns the strategy for the given strategy id.
        /// * `strategy_id` - The strategy id.
        fn get_strategy(self: @ContractState, strategy_id: felt252) -> Strategy {
            let strategy = self._strategies.read(strategy_id);
            assert(strategy.address.is_non_zero(), 'VSR: Strategy does not exist');

            strategy
        }

        /// Registers the given  strategy if it does not exist.
        /// * `strategy` - The  strategy.
        fn register_strategy_if_not_exists(ref self: ContractState, mut strategy: Strategy) -> felt252 {
            // The maximum parameter length is bound by the maximum storage offset.
            assert(strategy.params.len() <= 254, 'VSR: Too many parameters');

            let strategy_id = _compute_strategy_id(strategy);

            let stored_strategy = self._strategies.read(strategy_id);
            if stored_strategy.address.is_zero() {
                self._strategies.write(strategy_id, strategy);
                self.emit(Event::StrategyRegistered(StrategyRegistered { strategy_id, strategy }));
            }
            strategy_id
        }
    }

    /// Computes the strategy id for the given strategy.
    /// * `strategy` - The strategy.
    fn _compute_strategy_id(mut strategy: Strategy) -> felt252 {
        let mut strategy_array = ArrayTrait::new();
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
        poseidon_hash_span(strategy_array.span())
    }
}
