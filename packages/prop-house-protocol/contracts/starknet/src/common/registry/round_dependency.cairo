#[contract]
mod RoundDependencyRegistry {
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::{get_caller_address, ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::libraries::ownable::Ownable;
    use prop_house::common::utils::storage::SpanStorageAccess;
    use prop_house::common::utils::traits::IRoundDependencyRegistry;
    use prop_house::common::utils::serde::SpanSerde;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _is_key_locked: LegacyMap<(u64, felt252, felt252), bool>,
        _single_dependency: LegacyMap<(u64, felt252, felt252), ContractAddress>,
        _multiple_dependencies: LegacyMap<(u64, felt252, felt252), Span<ContractAddress>>,
    }

    /// Emitted when a dependency key is locked for an origin chain ID and round type.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    #[event]
    fn KeyLocked(origin_chain_id: u64, round_type: felt252) {}

    /// Emitted when a dependency is updated for a chain ID, round type and key.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The dependency key.
    /// * `dependency` - The dependency address.
    #[event]
    fn DependencyUpdated(origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress) {}

    /// Emitted when dependencies are updated for a chain ID, round type and key.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The dependency key.
    /// * `dependencies` - The dependency addresses.
    #[event]
    fn DependenciesUpdated(origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>) {}

    impl RoundDependencyRegistry of IRoundDependencyRegistry {
        fn is_key_locked(origin_chain_id: u64, round_type: felt252, key: felt252) -> bool {
            _is_key_locked::read((origin_chain_id, round_type, key))
        }

        fn get_dependency_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> ContractAddress {
            assert(_is_key_locked::read((origin_chain_id, round_type, key)), 'MCRCR: Dependency not locked');

            _single_dependency::read((origin_chain_id, round_type, key))
        }

        fn get_dependencies_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> Span<ContractAddress> {
            assert(_is_key_locked::read((origin_chain_id, round_type, key)), 'MCRCR: Dependencies not locked');

            _multiple_dependencies::read((origin_chain_id, round_type, key))
        }

        fn update_dependency_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress) {
            Ownable::assert_only_owner();

            assert(!_is_key_locked::read((origin_chain_id, round_type, key)), 'MCRCR: Dependency locked');
            _single_dependency::write((origin_chain_id, round_type, key), dependency);

            DependencyUpdated(origin_chain_id, round_type, key, dependency);
        }

        fn update_dependencies_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>) {
            Ownable::assert_only_owner();

            assert(!_is_key_locked::read((origin_chain_id, round_type, key)), 'MCRCR: Dependencies locked');
            _multiple_dependencies::write((origin_chain_id, round_type, key), dependencies);

            DependenciesUpdated(origin_chain_id, round_type, key, dependencies);
        }

        fn lock_key(origin_chain_id: u64, round_type: felt252, key: felt252) {
            Ownable::assert_only_owner();

            assert(!_is_key_locked::read((origin_chain_id, round_type, key)), 'MCRCR: Key already locked');
            _is_key_locked::write((origin_chain_id, round_type, key), true);

            KeyLocked(origin_chain_id, round_type);
        }
    }

    #[constructor]
    fn constructor(initial_owner: ContractAddress) {
        Ownable::initializer(initial_owner);
    }

    /// Returns true if the key is locked for the given chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    #[view]
    fn is_key_locked(origin_chain_id: u64, round_type: felt252, key: felt252) -> bool {
        RoundDependencyRegistry::is_key_locked(origin_chain_id, round_type, key)
    }

    /// Returns the dependency at the given key for the provided chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    #[view]
    fn get_dependency_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> ContractAddress {
        RoundDependencyRegistry::get_dependency_at_key(origin_chain_id, round_type, key)
    }

    /// Returns the dependencies at the given key for the provided chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    #[view]
    fn get_dependencies_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> Span<ContractAddress> {
        RoundDependencyRegistry::get_dependencies_at_key(origin_chain_id, round_type, key)
    }

    /// Returns the owner of the contract.
    #[view]
    fn owner() -> ContractAddress {
        Ownable::owner()
    }

    /// If not locked, updates the dependency at the given key for the provided chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    /// * `dependency` - The dependency.
    #[external]
    fn update_dependency_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress) {
        RoundDependencyRegistry::update_dependency_if_not_locked(origin_chain_id, round_type, key, dependency)
    }

    /// If not locked, updates the dependencies at the given key for the provided chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    /// * `dependencies` - The dependencies.
    #[external]
    fn update_dependencies_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>) {
        RoundDependencyRegistry::update_dependencies_if_not_locked(origin_chain_id, round_type, key, dependencies)
    }

    /// Locks the key for the given chain id and round.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The key.
    #[external]
    fn lock_key(origin_chain_id: u64, round_type: felt252, key: felt252) {
        RoundDependencyRegistry::lock_key(origin_chain_id, round_type, key)
    }

    /// Transfers ownership of the contract to a new owner.
    /// * `new_owner` - The new owner.
    #[external]
    fn transfer_ownership(new_owner: ContractAddress) {
        Ownable::transfer_ownership(new_owner);
    }
}
