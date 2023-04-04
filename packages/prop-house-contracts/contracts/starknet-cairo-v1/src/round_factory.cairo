use starknet::ContractAddress;

#[abi]
trait IRoundFactory {
    fn origin_round(starknet_round: ContractAddress) -> ContractAddress;
    fn origin_messenger() -> ContractAddress;
}

#[contract]
mod RoundFactory {
    use prop_house::round_factory::IRoundFactory;
    use starknet::ContractAddressIntoFelt252;
    use starknet::syscalls::deploy_syscall;
    use starknet::ContractAddress;
    use starknet::ClassHash;
    use array::ArrayTrait;
    use traits::Into;

    struct Storage {
        _origin_messenger: ContractAddress,
        _origin_round: LegacyMap<ContractAddress, ContractAddress>,
    }

    #[event]
    fn RoundRegistered(
        origin_round: ContractAddress, starknet_round: ContractAddress, round_class_hash: ClassHash
    ) {}

    impl RoundFactory of IRoundFactory {
        fn origin_round(starknet_round: ContractAddress) -> ContractAddress {
            _origin_round::read(starknet_round)
        }

        fn origin_messenger() -> ContractAddress {
            _origin_messenger::read()
        }
    }

    #[constructor]
    fn constructor(origin_messenger: ContractAddress) {
        initializer(origin_messenger);
    }

    #[view]
    fn origin_round(starknet_round: ContractAddress) -> ContractAddress {
        RoundFactory::origin_round(starknet_round)
    }

    #[view]
    fn origin_messenger() -> ContractAddress {
        RoundFactory::origin_messenger()
    }

    #[l1_handler]
    fn register_round(
        from_address: ContractAddress,
        origin_round: ContractAddress,
        round_class_hash: ClassHash,
        round_params: Array<felt252>,
    ) {
        _only_origin_messenger(from_address);

        let result = deploy_syscall(
            round_class_hash, origin_round.into(), round_params.span(), false
        );
        let (starknet_round, _) = result.unwrap_syscall();

        _origin_round::write(starknet_round, origin_round);

        RoundRegistered(origin_round, starknet_round, round_class_hash);
    }

    ///
    /// Internals
    ///

    fn initializer(origin_messenger_: ContractAddress) {
        _origin_messenger::write(origin_messenger_);
    }

    fn _only_origin_messenger(from_address_: ContractAddress) {
        let messenger = _origin_messenger::read();
        assert(from_address_ == messenger, 'RoundFactory: Not messenger');
    }
}
