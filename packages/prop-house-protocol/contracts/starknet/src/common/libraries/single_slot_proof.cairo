use prop_house::common::utils::constants::MULTIPLIER_FOR_64_BIT_SHIFT;
use option::OptionTrait;
use traits::TryInto;

#[starknet::interface]
trait IFactsRegistry<TContractState> {
    // Gets a storage slot from a proven account.
    // The account storage hash must be proven.
    // * `block` - The block number.
    // * `account` - The account to query.
    // * `slot` - The slot to query.
    fn get_storage(
        self: @TContractState, block: u256, account: felt252, slot: u256, mpt_proof: Span<Span<u64>>
    ) -> u256;
}

#[starknet::contract]
mod SingleSlotProof {
    use starknet::ContractAddress;
    use prop_house::common::registry::ethereum_block::{
        IEthereumBlockRegistryDispatcherTrait, IEthereumBlockRegistryDispatcher
    };
    use super::{IFactsRegistryDispatcherTrait, IFactsRegistryDispatcher};
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    use option::OptionTrait;

    #[storage]
    struct Storage {
        _fact_registry: ContractAddress,
        _ethereum_block_registry: ContractAddress,
    }

    /// Initializes the contract.
    /// * `fact_registry_` - The address of the Herodotus fact registry contract.
    /// * `ethereum_block_registry_` - The address of the ethereum block registry contract.
    fn initializer(ref self: ContractState, fact_registry_: ContractAddress, ethereum_block_registry_: ContractAddress) {
        self._fact_registry.write(fact_registry_);
        self._ethereum_block_registry.write(ethereum_block_registry_);
    }

    /// Returns the value of the mapping storage slot at the given timestamp.
    /// * `timestamp` - The timestamp of the block to query.
    /// * `contract_address` - The address of the contract whose storage will be queried.
    /// * `valid_slot` - The expected storage slot key.
    /// * `params` - The params, containing the contract address and slot index.
    /// * `user_params` - The user params, containing the slot and MPT proof.
    fn get_slot_value(
        self: @ContractState, timestamp: u64, contract_address: felt252, valid_slot: u256, params: Span<felt252>, mut user_params: Span<felt252>,
    ) -> u256 {
        let ethereum_block_registry = IEthereumBlockRegistryDispatcher {
            contract_address: self._ethereum_block_registry.read()
        };
        let eth_block_number = ethereum_block_registry.get_eth_block_number(timestamp).into();

        let (slot, mpt_proof) = Serde::<(u256, Span<Span<u64>>)>::deserialize(ref user_params).unwrap();
        assert(slot == valid_slot, 'SSP: Invalid slot');

        let facts_registry = IFactsRegistryDispatcher { contract_address: self._fact_registry.read() };
        let slot_value = facts_registry.get_storage(
            eth_block_number - 1, // Shift by 1. The proven hash is the parent of the stored block.
            contract_address,
            slot,
            mpt_proof,
        );
        slot_value
    }
}
