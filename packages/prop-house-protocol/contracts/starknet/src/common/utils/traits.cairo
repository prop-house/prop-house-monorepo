use starknet::ContractAddress;

#[starknet::interface]
trait IRoundFactory<TContractState> {
    fn starknet_round(self: @TContractState, origin_round: felt252) -> ContractAddress;
    fn origin_round(self: @TContractState, starknet_round: ContractAddress) -> felt252;
    fn origin_messenger(self: @TContractState) -> felt252;
    fn origin_chain_id(self: @TContractState) -> u64;
}

#[starknet::interface]
trait IGovernancePowerStrategy<TContractState> {
    fn get_power(
        self: @TContractState, timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256;
}

#[starknet::interface]
trait IExecutionStrategy<TContractState> {
    fn execute(self: @TContractState, params: Span<felt252>);
}

#[starknet::interface]
trait IRoundDependencyRegistry<TContractState> {
    fn owner(self: @TContractState) -> ContractAddress;
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn is_key_locked(self: @TContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> bool;
    fn get_dependency_at_key(self: @TContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> ContractAddress;
    fn get_dependencies_at_key(self: @TContractState, origin_chain_id: u64, round_type: felt252, key: felt252) -> Span<ContractAddress>;
    fn update_dependency_if_not_locked(ref self: TContractState, origin_chain_id: u64, round_type: felt252, key: felt252, dependency: ContractAddress);
    fn update_dependencies_if_not_locked(ref self: TContractState, origin_chain_id: u64, round_type: felt252, key: felt252, dependencies: Span<ContractAddress>);
    fn lock_key(ref self: TContractState, origin_chain_id: u64, round_type: felt252, key: felt252);
}
