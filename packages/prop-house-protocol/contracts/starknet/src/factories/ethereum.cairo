use starknet::ContractAddress;

#[abi]
trait IEthereumRoundFactory {
    fn origin_round(starknet_round: ContractAddress) -> felt252;
    fn origin_messenger() -> felt252;
}

// TODO: Need a router as well?
// This solves our chain id issue as well.

// Maybe call it Ethereum entry point?

#[contract]
mod EthereumRoundFactory {
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, ClassHash};
    use super::IEthereumRoundFactory;
    use zeroable::Zeroable;
    use array::ArrayTrait;

    struct Storage {
        _origin_messenger: felt252,
        _origin_round: LegacyMap<ContractAddress, felt252>,
        _starknet_round: LegacyMap<felt252, ContractAddress>,
    }

    #[event]
    fn RoundRegistered(
        origin_round: felt252, starknet_round: ContractAddress, round_class_hash: ClassHash
    ) {}

    impl EthereumRoundFactory of IEthereumRoundFactory {
        fn origin_round(starknet_round: ContractAddress) -> felt252 {
            _origin_round::read(starknet_round)
        }

        fn origin_messenger() -> felt252 {
            _origin_messenger::read()
        }
    }

    #[constructor]
    fn constructor(origin_messenger: felt252) {
        initializer(origin_messenger);
    }

    /// Returns the origin chain ID for all rounds deployed by this factory.
    #[view]
    fn origin_chain_id() -> u64 {
        1
    }

    /// Returns the origin round address for a given starknet round address.
    /// * `starknet_round` - The starknet round address.
    #[view]
    fn origin_round(starknet_round: ContractAddress) -> felt252 {
        EthereumRoundFactory::origin_round(starknet_round)
    }

    /// Returns the origin messenger address.
    #[view]
    fn origin_messenger() -> felt252 {
        EthereumRoundFactory::origin_messenger()
    }

    /// Registers a new round.
    /// * `from_address` - The address of the sender.
    /// * `origin_round` - The origin round address.
    /// * `round_class_hash` - The class hash of the round.
    /// * `round_params` - The round parameters.
    #[l1_handler]
    fn register_round(
        from_address: felt252,
        origin_round: felt252,
        round_class_hash: ClassHash,
        round_params: Array<felt252>,
    ) {
        _only_origin_messenger(from_address);

        let result = deploy_syscall(round_class_hash, origin_round, round_params.span(), false);
        let (starknet_round, _) = result.unwrap_syscall();

        _origin_round::write(starknet_round, origin_round);
        _starknet_round::write(origin_round, starknet_round);

        RoundRegistered(origin_round, starknet_round, round_class_hash);
    }

    /// Routes a call from an origin chain round to a starknet round contract.
    /// * `from_address` - The address of the sender.
    /// * `origin_round` - The origin round address.
    /// * `selector` - The selector of the entry point to call.
    /// * `cdata` - The calldata to pass to the entry point.
    #[l1_handler]
    fn route_call_to_round(
        from_address: felt252,
        origin_round: felt252,
        selector: felt252,
        cdata: Array<felt252>,
    ) {
        _only_origin_messenger(from_address);

        let target = _starknet_round::read(origin_round);
        assert(target.is_non_zero(), 'EthereumRF: Invalid round');

        starknet::call_contract_syscall(
            address: target, entry_point_selector: selector, calldata: cdata.span(), 
        )
        .unwrap_syscall();
    }

    ///
    /// Internals
    ///

    fn initializer(origin_messenger_: felt252) {
        _origin_messenger::write(origin_messenger_);
    }

    /// Asserts that the from address is the origin messenger.
    /// * `from_address_` - The address of the sender.
    fn _only_origin_messenger(from_address_: felt252) {
        let messenger = _origin_messenger::read();
        assert(from_address_ == messenger, 'EthereumRF: Not messenger');
    }
}
