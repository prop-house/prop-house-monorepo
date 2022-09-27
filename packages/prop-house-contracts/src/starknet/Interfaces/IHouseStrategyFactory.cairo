%lang starknet

@contract_interface
namespace IHouseStrategyFactory:
    func get_l1_house(strategy_address : felt) -> (house_address : felt):
    end
end
