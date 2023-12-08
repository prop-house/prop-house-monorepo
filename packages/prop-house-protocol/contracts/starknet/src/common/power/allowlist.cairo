#[starknet::contract]
mod AllowlistGovernancePowerStrategy {
    use prop_house::common::utils::merkle::MerkleTreeTrait;
    use prop_house::common::utils::traits::IGovernancePowerStrategy;
    use prop_house::common::utils::hash::compute_hash_on_elements;
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    use option::OptionTrait;
    use hash::LegacyHash;

    #[storage]
    struct Storage {}

    #[external(v0)]
    impl AllowlistGovernancePowerStrategy of IGovernancePowerStrategy<ContractState> {
        /// Returns the governance power of a user.
        /// * `timestamp` - The timestamp at which to get the governance power.
        /// * `user` - The address of the user.
        /// * `params` - The params, containing the merkle root.
        /// * `user_params` - The user params, containing the user address, power, and proof.
        fn get_power(
            self: @ContractState, timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
        ) -> u256 {
            _get_power(timestamp, user, params, user_params)
        }
    }

    /// Returns the governance power of a user.
    /// * `timestamp` - The timestamp at which to get the governance power.
    /// * `user` - The address of the user.
    /// * `params` - The params, containing the merkle root.
    /// * `user_params` - The user params, containing the user address, power, and proof.
    fn _get_power(
        timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        let user_params_len = user_params.len();
        let leaf_len = 3; // [user, governance_power.low, governance_power.high]

        assert(user_params_len >= leaf_len && params.len() >= 1, 'Allowlist: Invalid parameters');

        let leaf_user = *user_params.at(0);
        let leaf_gov_power_low = *user_params.at(1);
        let leaf_gov_power_high = *user_params.at(2);
        assert(leaf_user == user, 'Allowlist: Invalid leaf');
        
        let leaf_inputs = array![leaf_user, leaf_gov_power_low, leaf_gov_power_high];
        let leaf = compute_hash_on_elements(leaf_inputs.span());
        let proof = user_params.slice(leaf_len, user_params_len - leaf_len);

        let merkle_root = *params.at(0);
        let mut merkle_tree = MerkleTreeTrait::<felt252>::new();

        // Verify the proof is valid
        assert(merkle_tree.verify_proof(merkle_root, leaf, proof), 'Allowlist: Invalid proof');

        // Return the governance power
        u256 { low: leaf_gov_power_low.try_into().unwrap(), high: leaf_gov_power_high.try_into().unwrap() }
    }
}
