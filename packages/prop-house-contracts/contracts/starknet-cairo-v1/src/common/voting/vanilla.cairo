#[contract]
mod VanillaVotingStrategy {
    use starknet::ContractAddress;
    use prop_house::common::lib::traits::IVotingStrategy;

    impl VanillaVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u32,
            voter_address: ContractAddress,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> felt252 {
            1
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> felt252 {
        VanillaVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }
}
