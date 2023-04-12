#[contract]
mod VanillaVotingStrategy {
    use starknet::ContractAddress;
    use prop_house::common::lib::traits::IVotingStrategy;

    impl VanillaVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u64,
            voter_address: ContractAddress,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> u256 {
            u256 { low: 1, high: 0 }
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u64,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> u256 {
        VanillaVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }
}
