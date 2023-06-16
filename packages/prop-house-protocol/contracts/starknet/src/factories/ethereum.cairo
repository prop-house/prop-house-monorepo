#[contract]
mod EthereumRoundFactory {
    use starknet::syscalls::deploy_syscall;
    use starknet::{ContractAddress, ClassHash};
    use prop_house::common::libraries::round::Asset;
    use prop_house::common::utils::serde::SpanSerde;
    use prop_house::common::utils::traits::IRoundFactory;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;

    struct Storage {
        _origin_messenger: felt252,
        _origin_round: LegacyMap<ContractAddress, felt252>,
        _origin_round_balances: LegacyMap<(felt252, u256), u256>,
        _starknet_round: LegacyMap<felt252, ContractAddress>,   
    }

    #[event]
    fn RoundRegistered(
        origin_round: felt252, starknet_round: ContractAddress, round_class_hash: ClassHash
    ) {}

    impl EthereumRoundFactory of IRoundFactory {
        fn starknet_round(origin_round: felt252) -> ContractAddress {
            _starknet_round::read(origin_round)
        }

        fn origin_round(starknet_round: ContractAddress) -> felt252 {
            _origin_round::read(starknet_round)
        }

        fn origin_round_balance(starknet_round: ContractAddress, asset_id: u256) -> u256 {
            let origin_round = _origin_round::read(starknet_round);
            assert(origin_round.is_non_zero(), 'EthereumRF: Invalid round');

            _origin_round_balances::read((origin_round, asset_id))
        }

        fn origin_round_balances(starknet_round: ContractAddress, mut asset_ids: Span<u256>) -> Span<u256> {
            let origin_round = _origin_round::read(starknet_round);
            assert(origin_round.is_non_zero(), 'EthereumRF: Invalid round');

            let mut balances = Default::<Array<u256>>::default();
            loop {
                match asset_ids.pop_front() {
                    Option::Some(asset_id) => {
                        let key = (origin_round, *asset_id);
                        let balance = _origin_round_balances::read(key);
                        balances.append(balance);
                    },
                    Option::None(()) => {
                        break balances.span();
                    }
                };
            }
        }

        fn origin_messenger() -> felt252 {
            _origin_messenger::read()
        }

        fn origin_chain_id() -> u64 {
            1
        }
    }

    #[constructor]
    fn constructor(origin_messenger: felt252) {
        initializer(origin_messenger);
    }

    /// Returns the starknet round address for a given origin round address.
    /// * `origin_round` - The origin round address.
    #[view]
    fn starknet_round(origin_round: felt252) -> ContractAddress {
        EthereumRoundFactory::starknet_round(origin_round)
    }

    /// Returns the origin round address for a given starknet round address.
    /// * `starknet_round` - The starknet round address.
    #[view]
    fn origin_round(starknet_round: ContractAddress) -> felt252 {
        EthereumRoundFactory::origin_round(starknet_round)
    }

    /// Returns the balance of a given asset in a given origin round.
    /// * `starknet_round` - The starknet round address.
    /// * `asset_id` - The asset ID.
    #[view]
    fn origin_round_balance(starknet_round: ContractAddress, asset_id: u256) -> u256 {
        EthereumRoundFactory::origin_round_balance(starknet_round, asset_id)
    }

    /// Returns the balances of given assets in a given origin round.
    /// * `starknet_round` - The starknet round address.
    /// * `asset_ids` - The asset IDs.
    #[view]
    fn origin_round_balances(starknet_round: ContractAddress, asset_ids: Span<u256>) -> Span<u256> {
        EthereumRoundFactory::origin_round_balances(starknet_round, asset_ids)
    }

    /// Returns the origin messenger address.
    #[view]
    fn origin_messenger() -> felt252 {
        EthereumRoundFactory::origin_messenger()
    }

    /// Returns the origin chain ID for all rounds deployed by this factory.
    #[view]
    fn origin_chain_id() -> u64 {
        EthereumRoundFactory::origin_chain_id()
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

    /// Receives deposit information from an origin chain round.
    /// Unlike `route_call_to_round`, this function does not require the
    /// round to be registered.
    /// * `from_address` - The address of the sender.
    /// * `origin_round` - The origin round address.
    /// * `assets` - The deposited assets.
    #[l1_handler]
    fn record_deposit(
        from_address: felt252,
        origin_round: felt252,
        mut assets: Span<Asset>,
    ) {
        _only_origin_messenger(from_address);

        loop {
            match assets.pop_front() {
                Option::Some(a) => {
                    let a = *a;
                    let key = (origin_round, a.asset_id);
                    let balance = _origin_round_balances::read(key);
                    _origin_round_balances::write(key, balance + a.amount);
                },
                Option::None(()) => {
                    break;
                },
            };
        };
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
