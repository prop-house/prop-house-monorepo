use starknet::ContractAddress;

#[abi]
trait IRoundFactory {
    fn origin_round(starknet_round: ContractAddress) -> felt252;
    fn origin_messenger() -> felt252;
}

#[contract]
mod RoundFactory {
    use starknet::syscalls::deploy_syscall;
    use starknet::ContractAddress;
    use starknet::ClassHash;
    use super::IRoundFactory;
    use array::ArrayTrait;

    struct Storage {
        _origin_messenger: felt252,
        _origin_round: LegacyMap<ContractAddress, felt252>,
    }

    #[event]
    fn RoundRegistered(
        origin_round: felt252, starknet_round: ContractAddress, round_class_hash: ClassHash
    ) {}

    impl RoundFactory of IRoundFactory {
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

    #[view]
    fn origin_round(starknet_round: ContractAddress) -> felt252 {
        RoundFactory::origin_round(starknet_round)
    }

    #[view]
    fn origin_messenger() -> felt252 {
        RoundFactory::origin_messenger()
    }

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

        RoundRegistered(origin_round, starknet_round, round_class_hash);
    }

    ///
    /// Internals
    ///

    fn initializer(origin_messenger_: felt252) {
        _origin_messenger::write(origin_messenger_);
    }

    fn _only_origin_messenger(from_address_: felt252) {
        let messenger = _origin_messenger::read();
        assert(from_address_ == messenger, 'RoundFactory: Not messenger');
    }
}
