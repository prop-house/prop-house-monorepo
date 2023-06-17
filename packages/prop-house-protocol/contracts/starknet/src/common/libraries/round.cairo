use prop_house::common::utils::serde::SpanSerde;
use prop_house::common::registry::strategy::Strategy;

#[derive(Copy, Drop, Serde)]
struct Asset {
    asset_id: u256,
    amount: u256,
}

#[derive(Copy, Drop, Serde)]
struct StrategyGroup {
    strategy_type: u8,
    strategies: Span<Strategy>,
}

#[derive(Copy, Drop, Serde)]
struct UserStrategy {
    id: felt252,
    user_params: Span<felt252>,
}

#[contract]
mod Round {
    use starknet::{
        get_caller_address, EthAddress, EthAddressIntoFelt252, Felt252TryIntoContractAddress,
    };
    use prop_house::common::registry::strategy::{IStrategyRegistryDispatcherTrait, Strategy};
    use prop_house::common::utils::traits::{
        IRoundFactoryDispatcherTrait, IRoundFactoryDispatcher,
        IGovernancePowerStrategyDispatcherTrait, IGovernancePowerStrategyDispatcher,
        IRoundDependencyRegistryDispatcherTrait,
    };
    use prop_house::common::utils::array::{construct_2d_array, get_sub_array, SpanTraitExt};
    use prop_house::common::utils::contract::{get_strategy_registry, get_round_dependency_registry};
    use prop_house::common::utils::constants::{MASK_250, DependencyKey};
    use prop_house::common::utils::hash::keccak_u256s_be;
    use super::{Asset, UserStrategy, StrategyGroup};
    use array::{ArrayTrait, SpanTrait};
    use integer::U32IntoFelt252;
    use traits::{TryInto, Into};
    use dict::Felt252DictTrait;
    use option::OptionTrait;
    use zeroable::Zeroable;

    struct Storage {
        _deployer: IRoundFactoryDispatcher,
        _is_strategy_registered: LegacyMap<(u8, felt252), bool>,
    }

    /// Initializes the contract by setting the origin chain ID
    /// and registering the provided strategy groups.
    fn initializer(mut strategy_groups_: Span<StrategyGroup>) {
        _deployer::write(IRoundFactoryDispatcher { contract_address: get_caller_address(),  });
        _register_strategy_groups(strategy_groups_);
    }

    /// Returns the origin chain ID.
    fn origin_chain_id() -> u64 {
        _deployer::read().origin_chain_id()
    }

    /// Parse strategies from a flattened array of parameters.
    /// * `params` - The flattened array of parameters.
    /// * `starting_index` - The index of the first parameter to parse.
    fn parse_strategies(
        params: Span<felt252>, mut starting_index: usize
    ) -> (Span<Strategy>, usize) {
        let strategy_addresses_len = (*params.at(starting_index)).try_into().unwrap();
        let strategy_addresses = params.slice(starting_index + 1, strategy_addresses_len);

        let strategy_params_flat_len = (*params.at(starting_index + 1 + strategy_addresses_len)).try_into().unwrap();
        let strategy_params_flat = params.slice(starting_index + 2 + strategy_addresses_len, strategy_params_flat_len);
        let array_2d = construct_2d_array(strategy_params_flat);

        let mut i = 0;
        let mut strategies = Default::<Array<Strategy>>::default();
        loop {
            if i == strategy_addresses_len {
                break (
                    strategies.span(),
                    starting_index + 2 + strategy_addresses_len + strategy_params_flat_len
                );
            }
            let address = (*strategy_addresses.at(i)).try_into().unwrap();
            let params = get_sub_array(array_2d, i);

            strategies.append(Strategy { address, params });
            i += 1;
        }
    }

    /// Asserts that the caller is a valid auth strategy.
    /// * `round_type` - The type of round to check the auth strategy for.
    fn assert_caller_is_valid_auth_strategy(round_type: felt252) {
        let auth_strategies = get_round_dependency_registry().get_dependencies_at_key(
            origin_chain_id(), round_type, DependencyKey::AUTH_STRATEGIES,
        );
        assert(auth_strategies.contains(get_caller_address()), 'Invalid auth strategy');
    }

    /// Asserts that the caller is the deployer.
    fn assert_caller_is_deployer() {
        assert(get_caller_address() == _deployer::read().contract_address, 'Caller is not deployer');
    }

    /// Returns the cumulative governance power of the given user for the provided strategies.
    /// * `timestamp` - The timestamp at which to calculate the cumulative governance power.
    /// * `user_address` - The address of the user.
    /// * `strategy_type` - The type of strategy to calculate the cumulative governance power for.
    /// * `used_strategies` - The strategies used to calculate the cumulative governance power of the user.
    fn get_cumulative_governance_power(
        timestamp: u64,
        user_address: EthAddress,
        strategy_type: u8,
        mut used_strategies: Span<UserStrategy>,
    ) -> u256 {
        let mut is_used = Default::<Felt252Dict<felt252>>::default();
        let strategy_registry = get_strategy_registry();

        let mut i = 0;
        let mut cumulative_power = 0;
        loop {
            match used_strategies.pop_front() {
                Option::Some(s) => {
                    let s = *s;

                    assert(_is_strategy_registered::read((strategy_type, s.id)), 'Strategy not registered');
                    assert(is_used.get(s.id).is_zero(), 'Duplicate strategy ID');

                    let strategy = strategy_registry.get_strategy(s.id);
                    let governance_power_strategy = IGovernancePowerStrategyDispatcher {
                        contract_address: strategy.address
                    };
                    let power = governance_power_strategy.get_power(
                        timestamp, user_address.into(), strategy.params, s.user_params,
                    );

                    i += 1;
                    cumulative_power += power;
                    is_used.insert(s.id, 1);
                },
                Option::None(_) => {
                    break;
                },
            };
        };
        is_used.squash();
        cumulative_power
    }

    // Flatten and ABI-encode (adds data offset + array length prefix) an array of assets.
    /// * `assets` - The array of assets to flatten and encode.
    fn flatten_and_abi_encode_assets(mut assets: Span<Asset>) -> Span<u256> {
        let asset_count: felt252 = assets.len().into();

        let mut flattened_assets = Default::default();
        flattened_assets.append(0x20.into()); // Data offset
        flattened_assets.append(asset_count.into()); // Array length

        loop {
            match assets.pop_front() {
                Option::Some(a) => {
                    flattened_assets.append(*a.asset_id);
                    flattened_assets.append(*a.amount);
                },
                Option::None(_) => {
                    break flattened_assets.span();
                },
            };
        }
    }

    /// ABI-encodes the provided asset array, keccak256 hashes it,
    /// and returns the lower 250 bits of the hash.
    /// * `assets` - The array of assets to hash.
    fn compute_asset_hash(assets: Span<Asset>) -> felt252 {
        (keccak_u256s_be(flatten_and_abi_encode_assets(assets)) & MASK_250).try_into().unwrap()
    }

    /// Register the provided strategy groups if they are not already registered.
    /// * `strategy_groups` - The strategy groups to register.
    fn _register_strategy_groups(mut strategy_groups: Span<StrategyGroup>) {
        let strategy_registry = get_strategy_registry();
        loop {
            match strategy_groups.pop_front() {
                Option::Some(group) => {
                    let group = *group;
                    let mut strategies = group.strategies;
                    match strategies.pop_front() {
                        Option::Some(strategy) => {
                            let strategy_id = strategy_registry.register_strategy_if_not_exists(
                                *strategy,
                            );
                            _is_strategy_registered::write((group.strategy_type, strategy_id), true);
                        },
                        Option::None(_) => {
                            break;
                        },
                    }
                },
                Option::None(_) => {
                    break;
                },
            };
        };
    }
}
