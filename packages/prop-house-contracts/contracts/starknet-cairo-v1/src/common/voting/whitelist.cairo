#[contract]
mod WhitelistVotingStrategy {
    use starknet::ContractAddress;
    use starknet::ContractAddressIntoFelt252;
    use quaireaux_data_structures::merkle_tree::MerkleTreeTrait;
    use prop_house::common::lib::traits::IVotingStrategy;
    use quaireaux_utils::check_gas;
    use option::OptionTrait;
    use array::ArrayTrait;
    use hash::LegacyHash;
    use traits::TryInto;
    use traits::Into;

    impl WhitelistVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u32,
            voter_address: ContractAddress,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> u256 {
            _get_voting_power(timestamp, voter_address, params, user_params)
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> u256 {
        WhitelistVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }

    fn _get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> u256 {
        let user_params_len = user_params.len();
        let leaf_len = 3; // [voter_address, voting_power.low, voting_power.high]

        assert(user_params_len >= leaf_len, 'Whitelist: Invalid parameters');

        let leaf_voter_address = *user_params.at(0);
        let leaf_voting_power = u256 {
            low: (*user_params.at(1)).try_into().unwrap(),
            high: (*user_params.at(2)).try_into().unwrap()
        };

        assert(leaf_voter_address == voter_address.into(), 'Whitelist: Invalid leaf');

        let leaf = LegacyHash::hash(leaf_voter_address, leaf_voting_power);
        let mut proof = ArrayTrait::new();

        // Extract the proof from the user params
        let mut i = leaf_len;
        loop {
            check_gas();

            if i == user_params_len {
                break ();
            }
            proof.append(*user_params.at(i));
            i = i + 1;
        };

        let merkle_root = *params.at(0);
        let mut merkle_tree = MerkleTreeTrait::new();

        // Verify the proof is valid
        assert(merkle_tree.verify(merkle_root, leaf, proof), 'Whitelist: Invalid proof');

        // Return the voting power
        leaf_voting_power
    }
}
