#[contract]
mod EthereumExecutionStrategy {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::syscalls::send_message_to_l1_syscall;
    use prop_house::round_factory::{
        IRoundFactory, IRoundFactoryDispatcher, IRoundFactoryDispatcherTrait
    };
    use prop_house::common::utils::traits::IExecutionStrategy;
    use prop_house::common::utils::serde::SpanSerde;
    use zeroable::Zeroable;
    use array::ArrayTrait;

    struct Storage {
        _round_factory: ContractAddress,
    }

    impl EthereumExecutionStrategy of IExecutionStrategy {
        fn execute(params: Span<felt252>) {
            send_message_to_l1_syscall(to_address: _origin_round_for_caller(), payload: params);
        }
    }

    #[constructor]
    fn constructor(round_factory: ContractAddress) {
        initializer(round_factory);
    }

    #[external]
    fn execute(params: Span<felt252>) {
        EthereumExecutionStrategy::execute(params);
    }

    ///
    /// Internals
    ///

    fn initializer(round_factory_: ContractAddress) {
        _round_factory::write(round_factory_);
    }

    fn _origin_round_for_caller() -> felt252 {
        let round_factory = _round_factory::read();
        let caller = get_caller_address();

        let round_factory = IRoundFactoryDispatcher { contract_address: round_factory };
        let origin_round = round_factory.origin_round(caller);

        assert(origin_round.is_non_zero(), 'ETHStrategy: Invalid caller');

        origin_round
    }
}
