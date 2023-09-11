#[starknet::contract]
mod VanillaGovernancePowerStrategy {
    use prop_house::common::utils::traits::IGovernancePowerStrategy;

    #[storage]
    struct Storage {}

    #[external(v0)]
    impl VanillaGovernancePowerStrategy of IGovernancePowerStrategy<ContractState> {
        /// Returns the governance power of a user.
        /// * `timestamp` - The timestamp at which to get the governance power.
        /// * `user` - The address of the user.
        /// * `params` - Empty params.
        /// * `user_params` - Empty user params.
        fn get_power(
            self: @ContractState, timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
        ) -> u256 {
            1
        }
    }
}
