#[contract]
mod EthereumExecutionStrategy {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::syscalls::send_message_to_l1_syscall;
    use prop_house::factories::ethereum::{
        IEthereumRoundFactory, IEthereumRoundFactoryDispatcher, IEthereumRoundFactoryDispatcherTrait
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

    /// Sends a message call to the origin round.
    #[external]
    fn execute(params: Span<felt252>) {
        EthereumExecutionStrategy::execute(params);
    }

    ///
    /// Internals
    ///

    /// Initializes the contract by setting the round factory address.
    fn initializer(round_factory_: ContractAddress) {
        _round_factory::write(round_factory_);
    }

    /// Returns the origin round address for the calling round.
    /// Throws if the caller is not a valid round.
    fn _origin_round_for_caller() -> felt252 {
        let round_factory = _round_factory::read();
        let caller = get_caller_address();

        let round_factory = IEthereumRoundFactoryDispatcher { contract_address: round_factory };
        let origin_round = round_factory.origin_round(caller);

        assert(origin_round.is_non_zero(), 'ETHStrategy: Invalid caller');

        origin_round
    }
}
