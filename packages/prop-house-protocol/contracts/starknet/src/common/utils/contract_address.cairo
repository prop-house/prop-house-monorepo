use starknet::{ContractAddress, contract_address_to_felt252};
use traits::Into;

impl ContractAddressIntoU256 of Into<ContractAddress, u256> {
    fn into(self: ContractAddress) -> u256 {
        contract_address_to_felt252(self).into()
    }
}
