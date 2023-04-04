use starknet::ContractAddress;

#[contract]
mod ETHStrategy {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use starknet::ContractAddressIntoFelt252;
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::syscalls::send_message_to_l1_syscall;
    use prop_house::round_factory::IRoundFactory;
    use prop_house::round_factory::IRoundFactoryDispatcher;
    use prop_house::round_factory::IRoundFactoryDispatcherTrait;
    use zeroable::Zeroable;
    use array::ArrayTrait;
    use traits::Into;

    struct Storage {
        _round_factory: ContractAddress,
    }

    #[constructor]
    fn constructor(round_factory: ContractAddress) {
        initializer(round_factory);
    }

    #[external]
    fn execute(params: Array<felt252>) {
        send_message_to_l1_syscall(
            to_address: _origin_round_for_caller().into(), payload: params.span()
        );
    }

    ///
    /// Internals
    ///

    fn initializer(round_factory_: ContractAddress) {
        _round_factory::write(round_factory_);
    }

    fn _origin_round_for_caller() -> ContractAddress {
        let round_factory = _round_factory::read();
        let caller = get_caller_address();

        let round_factory = IRoundFactoryDispatcher { contract_address: round_factory };
        let origin_round = round_factory.origin_round(caller);

        assert(origin_round.is_non_zero(), 'ETHStrategy: Invalid Caller');

        origin_round
    }
}
