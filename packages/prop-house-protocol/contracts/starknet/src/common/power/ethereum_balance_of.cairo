#[contract]
mod EthereumBalanceOfGovernancePowerStrategy {
    use starknet::ContractAddress;
    use prop_house::common::utils::serde::SpanSerde;
    use prop_house::common::utils::traits::IGovernancePowerStrategy;
    use prop_house::common::libraries::single_slot_proof::SingleSlotProof;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    impl EthereumBalanceOfGovernancePowerStrategy of IGovernancePowerStrategy {
        fn get_power(
            timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
        ) -> u256 {
            let params_len = params.len();

            // Expects contract_address slot_index, with an optional governance_power_multiplier
            // This bitor will be replaced with || once short-circuiting is supported.
            assert(params_len == 2 | params_len == 3, 'EthBO: Bad param length');

            let governance_power = SingleSlotProof::get_slot_value(
                timestamp, user, params, user_params
            );
            if params_len == 2 {
                return governance_power;
            }

            let governance_power_multiplier = *params.at(2);
            assert(governance_power_multiplier.is_non_zero(), 'EthBO: Invalid multiplier');

            governance_power * governance_power_multiplier.into()
        }
    }

    #[constructor]
    fn constructor(fact_registry: ContractAddress, ethereum_block_registry: ContractAddress) {
        SingleSlotProof::initializer(fact_registry, ethereum_block_registry);
    }

    /// Returns the governance power of the user at the given timestamp.
    /// * `timestamp` - The timestamp at which to get the governance power.
    /// * `user` - The address of the user.
    /// * `params` - The params, containing the contract address and slot index.
    /// * `user_params` - The user params, containing the slot, proof sizes, and proofs.
    #[external]
    fn get_power(
        timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        EthereumBalanceOfGovernancePowerStrategy::get_power(
            timestamp, user, params, user_params
        )
    }
}
