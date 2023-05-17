#[contract]
mod WhitelistGovernancePowerStrategy {
    use prop_house::common::utils::merkle::MerkleTreeTrait;
    use prop_house::common::utils::traits::IGovernancePowerStrategy;
    use prop_house::common::utils::serde::SpanSerde;
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    use option::OptionTrait;
    use hash::LegacyHash;

    impl WhitelistGovernancePowerStrategy of IGovernancePowerStrategy {
        fn get_power(
            timestamp: u64,
            user_address: felt252,
            params: Span<felt252>,
            user_params: Span<felt252>,
        ) -> u256 {
            _get_power(timestamp, user_address, params, user_params)
        }
    }

    #[external]
    fn get_power(
        timestamp: u64, user_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        WhitelistGovernancePowerStrategy::get_power(timestamp, user_address, params, user_params)
    }

    fn _get_power(
        timestamp: u64, user_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        let user_params_len = user_params.len();
        let leaf_len = 3; // [user_address, governance_power.low, governance_power.high]

        assert(user_params_len >= leaf_len, 'Whitelist: Invalid parameters');

        let leaf_user_address = *user_params.at(0);
        let leaf_governance_power = u256 {
            low: (*user_params.at(1)).try_into().unwrap(),
            high: (*user_params.at(2)).try_into().unwrap()
        };

        assert(leaf_user_address == user_address, 'Whitelist: Invalid leaf');

        let leaf = LegacyHash::hash(leaf_user_address, leaf_governance_power);
        let proof = user_params.slice(leaf_len, user_params_len - leaf_len);

        let merkle_root = *params.at(0);
        let mut merkle_tree = MerkleTreeTrait::<felt252>::new();

        // Verify the proof is valid
        assert(merkle_tree.verify_proof(merkle_root, leaf, proof), 'Whitelist: Invalid proof');

        // Return the governance power
        leaf_governance_power
    }
}
