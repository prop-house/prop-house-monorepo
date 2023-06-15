use starknet::ContractAddress;
use prop_house::common::utils::serde::SpanSerde;

#[abi]
trait IRoundFactory {
    fn origin_chain_id() -> u64;
}

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

#[abi]
trait IRoundDependencyRegistry {
    fn is_key_locked(chain_id: u64, round_address: ContractAddress, key: felt252) -> bool;
    fn get_dependency_at_key(chain_id: u64, round_address: ContractAddress, key: felt252) -> ContractAddress;
    fn get_dependencies_at_key(chain_id: u64, round_address: ContractAddress, key: felt252) -> Span<ContractAddress>;
    fn get_caller_dependency_at_key(chain_id: u64, key: felt252) -> ContractAddress;
    fn get_caller_dependencies_at_key(chain_id: u64, key: felt252) -> Span<ContractAddress>;
    fn update_dependency_if_not_locked(chain_id: u64, round_address: ContractAddress, key: felt252, dependency: ContractAddress);
    fn update_dependencies_if_not_locked(chain_id: u64, round_address: ContractAddress, key: felt252, dependencies: Span<ContractAddress>);
    fn lock_key(chain_id: u64, round_address: ContractAddress, key: felt252);
}

#[abi]
trait IEthereumSigAuthStrategy {
    fn authenticate(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        target: ContractAddress,
        selector: felt252,
        cdata: Span<felt252>,
    );
}
