#[contract]
mod VanillaVotingStrategy {
    use prop_house::common::utils::traits::IVotingStrategy;
    use prop_house::common::utils::serde::SpanSerde;

    impl VanillaVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u64,
            voter_address: felt252,
            params: Span<felt252>,
            user_params: Span<felt252>,
        ) -> u256 {
            1
        }
    }

    #[external]
    fn get_voting_power(
        timestamp: u64, voter_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        VanillaVotingStrategy::get_voting_power(timestamp, voter_address, params, user_params)
    }
}
