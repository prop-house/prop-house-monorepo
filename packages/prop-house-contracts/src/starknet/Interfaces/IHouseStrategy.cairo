%lang starknet

# These must auto-increment for the funding house.
# House strategies give houses flexibility.

@contract_interface
namespace IHouseStrategy:
    func initialize(house_params_len : felt, house_params : felt*):
    end
end
