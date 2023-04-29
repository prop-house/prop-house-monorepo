#[contract]
mod EthereumBalanceOfVotingStrategy {
    use starknet::ContractAddress;
    use prop_house::common::utils::traits::IVotingStrategy;
    use prop_house::common::libraries::single_slot_proof::SingleSlotProof;
    use prop_house::common::utils::serde::SpanSerde;
    use array::{ArrayTrait, SpanTrait };
    use zeroable::Zeroable;
    use traits::Into;

    impl EthereumBalanceOfVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u64,
            voter_address: felt252,
            params: Span<felt252>,
            user_params: Span<felt252>,
        ) -> u256 {
            let params_len = params.len();

            // Expects contract_address slot_index, with an optional voting_power_multiplier
            assert(params_len == 2 | params_len == 3, 'EthBO: Bad param length');

            let voting_power = SingleSlotProof::get_slot_value(
                timestamp, voter_address, params, user_params
            );
            if params_len == 2 {
                return voting_power;
            }

            let voting_power_multiplier = *params.at(2);
            assert(voting_power_multiplier.is_non_zero(), 'EthBO: Invalid multiplier');

            voting_power * voting_power_multiplier.into()
        }
    }

    #[constructor]
    fn constructor(fact_registry: ContractAddress, ethereum_block_registry: ContractAddress) {
        SingleSlotProof::initializer(fact_registry, ethereum_block_registry);
    }

    /// Returns the voting power of the voter at the given timestamp.
    /// * `timestamp` - The timestamp at which to get the voting power.
    /// * `voter_address` - The address of the voter.
    /// * `params` - The params, containing the contract address and slot index.
    /// * `user_params` - The user params, containing the slot, proof sizes, and proofs.
    #[external]
    fn get_voting_power(
        timestamp: u64, voter_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        EthereumBalanceOfVotingStrategy::get_voting_power(
            timestamp, voter_address, params, user_params
        )
    }
}
