%lang starknet

@contract_interface
namespace IVotingStrategyRegistry:
    func get_voting_strategy(strategy_hash : felt) -> (
        strategy_addr : felt, strategy_params_len : felt, strategy_params : felt*
    ):
    end
end
