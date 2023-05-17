use starknet::ContractAddress;
use prop_house::common::utils::serde::SpanSerde;

#[abi]
trait IGovernancePowerStrategy {
    fn get_power(
        timestamp: u64, user_address: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256;
}

#[abi]
trait IExecutionStrategy {
    fn execute(params: Span<felt252>);
}
