#[starknet::contract]
mod EthereumExecutionStrategy {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::contract_address::ContractAddressZeroable;
    use starknet::syscalls::send_message_to_l1_syscall;
    use prop_house::common::utils::traits::{
        IRoundFactoryDispatcherTrait, IRoundFactoryDispatcher, IExecutionStrategy,
    };
    use zeroable::Zeroable;
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        _round_factory: ContractAddress, 
    }

    #[constructor]
    fn constructor(ref self: ContractState, round_factory: ContractAddress) {
        initializer(ref self, round_factory);
    }

    #[external(v0)]
    impl EthereumExecutionStrategy of IExecutionStrategy<ContractState> {
        /// Sends a message call to the origin round.
        fn execute(self: @ContractState, params: Span<felt252>) {
            send_message_to_l1_syscall(to_address: _origin_round_for_caller(self), payload: params);
        }
    }

    /// Initializes the contract by setting the round factory address.
    fn initializer(ref self: ContractState, round_factory_: ContractAddress) {
        self._round_factory.write(round_factory_);
    }

    /// Returns the origin round address for the calling round.
    /// Throws if the caller is not a valid round.
    fn _origin_round_for_caller(self: @ContractState) -> felt252 {
        let round_factory = self._round_factory.read();
        let caller = get_caller_address();

        let round_factory = IRoundFactoryDispatcher { contract_address: round_factory };
        let origin_round = round_factory.origin_round(caller);

        assert(origin_round.is_non_zero(), 'ETHStrategy: Invalid caller');

        origin_round
    }
}
