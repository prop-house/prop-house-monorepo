#[starknet::contract]
mod EthereumRoundFactory {
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, ClassHash};
    use prop_house::common::utils::traits::IRoundFactory;
    use zeroable::Zeroable;
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        _origin_chain_id: u64,
        _origin_messenger: felt252,
        _origin_round: LegacyMap<ContractAddress, felt252>,
        _starknet_round: LegacyMap<felt252, ContractAddress>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        RoundRegistered: RoundRegistered,
    }

    /// Emitted when a new round is registered.
    /// * `origin_round` - The origin round address.
    /// * `starknet_round` - The starknet round address.
    /// * `round_class_hash` - The class hash of the round.
    #[derive(Drop, starknet::Event)]
    struct RoundRegistered {
        origin_round: felt252, starknet_round: ContractAddress, round_class_hash: ClassHash,
    }

    #[constructor]
    fn constructor(ref self: ContractState, origin_chain_id: u64, origin_messenger: felt252) {
        initializer(ref self, origin_chain_id, origin_messenger);
    }

    #[external(v0)]
    impl EthereumRoundFactory of IRoundFactory<ContractState> {
        /// Returns the starknet round address for a given origin round address.
        /// * `origin_round` - The origin round address.
        fn starknet_round(self: @ContractState, origin_round: felt252) -> ContractAddress {
            self._starknet_round.read(origin_round)
        }

        /// Returns the origin round address for a given starknet round address.
        /// * `starknet_round` - The starknet round address.
        fn origin_round(self: @ContractState, starknet_round: ContractAddress) -> felt252 {
            self._origin_round.read(starknet_round)
        }

        /// Returns the origin messenger address.
        fn origin_messenger(self: @ContractState) -> felt252 {
            self._origin_messenger.read()
        }

        /// Returns the origin chain ID for all rounds deployed by this factory.
        fn origin_chain_id(self: @ContractState) -> u64 {
            self._origin_chain_id.read()
        }
    }

    /// Registers a new round.
    /// * `from_address` - The address of the sender.
    /// * `origin_round` - The origin round address.
    /// * `round_class_hash` - The class hash of the round.
    /// * `round_params` - The round parameters.
    #[l1_handler]
    fn register_round(
        ref self: ContractState,
        from_address: felt252,
        origin_round: felt252,
        round_class_hash: ClassHash,
        round_params: Array<felt252>,
    ) {
        _only_origin_messenger(@self, from_address);

        let result = deploy_syscall(round_class_hash, origin_round, round_params.span(), false);
        let (starknet_round, _) = result.unwrap_syscall();

        self._origin_round.write(starknet_round, origin_round);
        self._starknet_round.write(origin_round, starknet_round);

        self.emit(Event::RoundRegistered(
            RoundRegistered { origin_round, starknet_round, round_class_hash }
        ));
    }

    /// Routes a call from an origin chain round to a starknet round contract.
    /// * `from_address` - The address of the sender.
    /// * `origin_round` - The origin round address.
    /// * `selector` - The selector of the entry point to call.
    /// * `cdata` - The calldata to pass to the entry point.
    #[l1_handler]
    fn route_call_to_round(
        self: @ContractState, from_address: felt252, origin_round: felt252, selector: felt252, cdata: Array<felt252>, 
    ) {
        _only_origin_messenger(self, from_address);

        let target = self._starknet_round.read(origin_round);
        assert(target.is_non_zero(), 'EthereumRF: Invalid round');

        starknet::call_contract_syscall(
            address: target, entry_point_selector: selector, calldata: cdata.span(), 
        )
        .unwrap_syscall();
    }

    /// Initializes the contract.
    fn initializer(ref self: ContractState, origin_chain_id_: u64, origin_messenger_: felt252) {
        self._origin_chain_id.write(origin_chain_id_);
        self._origin_messenger.write(origin_messenger_);
    }

    /// Asserts that the from address is the origin messenger.
    /// * `from_address_` - The address of the sender.
    fn _only_origin_messenger(self: @ContractState, from_address_: felt252) {
        let messenger = self._origin_messenger.read();
        assert(from_address_ == messenger, 'EthereumRF: Not messenger');
    }
}
