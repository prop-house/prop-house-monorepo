%lang starknet

@contract_interface
namespace IVotingStrategyRegistry {
    func get_voting_strategy(strategy_id: felt) -> (
        strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*
    ) {
    }

    func register_voting_strategy_if_not_exists(
        strategy_addr: felt, strategy_params_len: felt, strategy_params: felt*
    ) -> (strategy_id: felt) {
    }
}
