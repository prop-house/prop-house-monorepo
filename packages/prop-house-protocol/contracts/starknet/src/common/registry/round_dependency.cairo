#[starknet::contract]
mod RoundDependencyRegistry {
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::{get_caller_address, ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::libraries::ownable::Ownable;
    use prop_house::common::utils::storage::SpanStore;
    use prop_house::common::utils::traits::IRoundDependencyRegistry;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    #[storage]
    struct Storage {
        _is_key_locked: LegacyMap<(u64, felt252, felt252), bool>,
        _single_dependency: LegacyMap<(u64, felt252, felt252), ContractAddress>,
        _multiple_dependencies: LegacyMap<(u64, felt252, felt252), Span<ContractAddress>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        KeyLocked: KeyLocked,
        DependencyUpdated: DependencyUpdated,
        DependenciesUpdated: DependenciesUpdated,
    }

    /// Emitted when a dependency key is locked for an origin chain ID and round type.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    #[derive(Drop, starknet::Event)]
    struct KeyLocked {
        origin_chain_id: u64, round_type: felt252
    }

    /// Emitted when a dependency is updated for a chain ID, round type and key.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The dependency key.
    /// * `dependency` - The dependency address.
    #[derive(Drop, starknet::Event)]
    struct DependencyUpdated {
        origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress
    }

    /// Emitted when dependencies are updated for a chain ID, round type and key.
    /// * `origin_chain_id` - The origin chain id.
    /// * `round_type` - The round type.
    /// * `key` - The dependency key.
    /// * `dependencies` - The dependency addresses.
    #[derive(Drop, starknet::Event)]
    struct DependenciesUpdated {
        origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        let mut ownable_state = Ownable::unsafe_new_contract_state();
        Ownable::initializer(ref ownable_state, initial_owner);
    }

    #[external(v0)]
    impl RoundDependencyRegistry of IRoundDependencyRegistry<ContractState> {
        /// Returns the owner of the contract.
        fn owner(self: @ContractState) -> ContractAddress {
            Ownable::owner(@Ownable::unsafe_new_contract_state())
        }

        /// Transfers ownership of the contract to a new owner.
        /// * `new_owner` - The new owner.
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            let mut ownable_state = Ownable::unsafe_new_contract_state();
            Ownable::transfer_ownership(ref ownable_state, new_owner);
        }

        /// Returns true if the key is locked for the given chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        fn is_key_locked(self: @ContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> bool {
            self._is_key_locked.read((origin_chain_id, round_type, key))
        }

        /// Returns the dependency at the given key for the provided chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        fn get_dependency_at_key(self: @ContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> ContractAddress {
            assert(self._is_key_locked.read((origin_chain_id, round_type, key)), 'MCRCR: Dependency not locked');

            self._single_dependency.read((origin_chain_id, round_type, key))
        }

        /// Returns the dependencies at the given key for the provided chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        fn get_dependencies_at_key(self: @ContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> Span<ContractAddress> {
            assert(self._is_key_locked.read((origin_chain_id, round_type, key)), 'MCRCR: Dependencies not locked');

            self._multiple_dependencies.read((origin_chain_id, round_type, key))
        }

        /// If not locked, updates the dependency at the given key for the provided chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        /// * `dependency` - The dependency.
        fn update_dependency_if_not_locked(ref self: ContractState, origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress) {
            Ownable::assert_only_owner(@Ownable::unsafe_new_contract_state());

            assert(!self._is_key_locked.read((origin_chain_id, round_type, key)), 'MCRCR: Dependency locked');
            self._single_dependency.write((origin_chain_id, round_type, key), dependency);

            self.emit(
                Event::DependencyUpdated(DependencyUpdated { origin_chain_id, round_type, key, dependency }),
            );
        }

        /// If not locked, updates the dependencies at the given key for the provided chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        /// * `dependencies` - The dependencies.
        fn update_dependencies_if_not_locked(ref self: ContractState, origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>) {
            Ownable::assert_only_owner(@Ownable::unsafe_new_contract_state());

            assert(!self._is_key_locked.read((origin_chain_id, round_type, key)), 'MCRCR: Dependencies locked');
            self._multiple_dependencies.write((origin_chain_id, round_type, key), dependencies);

            self.emit(
                Event::DependenciesUpdated(DependenciesUpdated { origin_chain_id, round_type, key, dependencies }),
            );
        }

        /// Locks the key for the given chain id and round.
        /// * `origin_chain_id` - The origin chain id.
        /// * `round_type` - The round type.
        /// * `key` - The key.
        fn lock_key(ref self: ContractState, origin_chain_id: u64, round_type: felt252, key: felt252) {
            Ownable::assert_only_owner(@Ownable::unsafe_new_contract_state());

            assert(!self._is_key_locked.read((origin_chain_id, round_type, key)), 'MCRCR: Key already locked');
            self._is_key_locked.write((origin_chain_id, round_type, key), true);

            self.emit(Event::KeyLocked(KeyLocked { origin_chain_id, round_type }));
        }
    }
}
