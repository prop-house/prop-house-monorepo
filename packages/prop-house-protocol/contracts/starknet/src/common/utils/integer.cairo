use starknet::{
    EthAddress, Felt252TryIntoEthAddress, ContractAddress, ContractAddressIntoFelt252,
    contract_address_to_felt252
};
use traits::{Into, TryInto};

fn as_u256(high: u128, low: u128) -> u256 {
    u256 { low, high }
}

impl ContractAddressIntoU256 of Into<ContractAddress, u256> {
    fn into(self: ContractAddress) -> u256 {
        contract_address_to_felt252(self).into()
    }
}

impl U256TryIntoEthAddress of TryInto<u256, EthAddress> {
    fn try_into(self: u256) -> Option<EthAddress> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU64 of TryInto<u256, u64> {
    fn try_into(self: u256) -> Option<u64> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU16 of TryInto<u256, u16> {
    fn try_into(self: u256) -> Option<u16> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU8 of TryInto<u256, u8> {
    fn try_into(self: u256) -> Option<u8> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}
