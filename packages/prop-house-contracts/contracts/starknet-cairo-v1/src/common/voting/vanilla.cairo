#[contract]
mod VanillaVotingStrategy {
    use prop_house::common::utils::traits::IVotingStrategy;

    impl VanillaVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u64,
            voter_address: felt252,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> u256 {
            u256 { low: 1, high: 0 }
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u64, voter_address: felt252, params: Array<felt252>, user_params: Array<felt252>, 
    ) -> u256 {
        VanillaVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }
}
