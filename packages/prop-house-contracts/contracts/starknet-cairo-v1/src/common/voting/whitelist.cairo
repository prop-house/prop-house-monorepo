#[contract]
mod WhitelistVotingStrategy {
    use starknet::ContractAddress;
    use starknet::ContractAddressIntoFelt252;
    use quaireaux_data_structures::merkle_tree::MerkleTreeTrait;
    use prop_house::common::lib::traits::IVotingStrategy;
    use array::ArrayTrait;
    use hash::LegacyHash;
    use traits::Into;

    impl WhitelistVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u32,
            voter_address: ContractAddress,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> felt252 {
            _get_voting_power(timestamp, voter_address, params, user_params)
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> felt252 {
        WhitelistVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }

    fn _get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> felt252 {
        let user_params_len = user_params.len();
        let leaf_len = 2_u32; // [voter_address, voting_power]

        assert(user_params_len >= leaf_len, 'Whitelist: Invalid parameters');

        let leaf_voter_address = *user_params.at(0_u32);
        let leaf_voting_power = *user_params.at(1_u32);
        assert(leaf_voter_address == voter_address.into(), 'Whitelist: Invalid leaf');

        let leaf = LegacyHash::hash(leaf_voter_address, leaf_voting_power);
        let mut proof = ArrayTrait::new();

        // Extract the proof from the user params
        let mut i = leaf_len;
        loop {
            if i == user_params_len {
                break ();
            }
            proof.append(*user_params.at(i));
            i = i + 1;
        };

        let merkle_root = *params.at(0_u32);
        let mut merkle_tree = MerkleTreeTrait::new();

        // Verify the proof is valid
        assert(merkle_tree.verify(merkle_root, leaf, proof), 'Whitelist: Invalid proof');

        // Return the voting power
        leaf_voting_power
    }
}
