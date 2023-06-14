#[contract]
mod VanillaGovernancePowerStrategy {
    use prop_house::common::utils::traits::IGovernancePowerStrategy;
    use prop_house::common::utils::serde::SpanSerde;

    impl VanillaGovernancePowerStrategy of IGovernancePowerStrategy {
        fn get_power(
            timestamp: u64,
            user_address: felt252,
            params: Span<felt252>,
            user_params: Span<felt252>,
        ) -> u256 {
            1
        }
    }

    /// Returns the governance power of a user.
    /// * `timestamp` - The timestamp at which to get the governance power.
    /// * `user_address` - The address of the user.
    /// * `params` - Empty params.
    /// * `user_params` - Empty user params.
    #[external]
    fn get_power(
        timestamp: u64, user_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        VanillaGovernancePowerStrategy::get_power(timestamp, user_address, params, user_params)
    }
}
