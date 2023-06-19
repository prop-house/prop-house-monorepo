use starknet::ContractAddress;
use prop_house::common::utils::serde::SpanSerde;

#[abi]
trait IRoundFactory {
    fn starknet_round(origin_round: felt252) -> ContractAddress;
    fn origin_round(starknet_round: ContractAddress) -> felt252;
    fn origin_messenger() -> felt252;
    fn origin_chain_id() -> u64;
}

#[abi]
trait IGovernancePowerStrategy {
    fn get_power(
        timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256;
}

#[abi]
trait IExecutionStrategy {
    fn execute(params: Span<felt252>);
}

#[abi]
trait IRoundDependencyRegistry {
    fn is_key_locked(origin_chain_id: u64, round_type: felt252, key: felt252) -> bool;
    fn get_dependency_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> ContractAddress;
    fn get_dependencies_at_key(origin_chain_id: u64, round_type: felt252, key: felt252) -> Span<ContractAddress>;
    fn update_dependency_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress);
    fn update_dependencies_if_not_locked(origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>);
    fn lock_key(origin_chain_id: u64, round_type: felt252, key: felt252);
}