use prop_house::common::utils::constants::MULTIPLIER_FOR_64_BIT_SHIFT;
use option::OptionTrait;
use traits::TryInto;

#[derive(Copy, Drop, Serde)]
struct StorageSlot {
    word_1: felt252,
    word_2: felt252,
    word_3: felt252,
    word_4: felt252,
}

impl StorageSlotIntoU256 of Into<StorageSlot, u256> {
    fn into(self: StorageSlot) -> u256 {
        let word_1_shifted = self.word_1 * MULTIPLIER_FOR_64_BIT_SHIFT;
        let word_3_shifted = self.word_3 * MULTIPLIER_FOR_64_BIT_SHIFT;
        let low = (word_3_shifted + self.word_4).try_into().unwrap();
        let high = (word_1_shifted + self.word_2).try_into().unwrap();

        u256 { low, high }
    }
}

#[starknet::interface]
trait IFactsRegistry<TContractState> {
    fn get_storage_uint(
        self: @TContractState,
        block: felt252,
        account_160: felt252,
        slot: StorageSlot,
        proof_sizes_bytes: Span<felt252>,
        proof_sizes_words: Span<felt252>,
        proofs_concat: Span<felt252>,
    ) -> u256;
}

#[starknet::contract]
mod SingleSlotProof {
    use starknet::ContractAddress;
    use prop_house::common::utils::storage::get_slot_key;
    use prop_house::common::registry::ethereum_block::{
        IEthereumBlockRegistryDispatcherTrait, IEthereumBlockRegistryDispatcher
    };
    use super::{IFactsRegistryDispatcherTrait, IFactsRegistryDispatcher};
    use super::{StorageSlotIntoU256, StorageSlot};
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
    /// * `user` - The user address to query.
    /// * `params` - The params, containing the contract address and slot index.
    /// * `user_params` - The user params, containing the slot, proof sizes, and proofs.
    fn get_slot_value(
        self: @ContractState, timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
    ) -> u256 {
        let ethereum_block_registry = IEthereumBlockRegistryDispatcher {
            contract_address: self._ethereum_block_registry.read()
        };
        let eth_block_number = ethereum_block_registry.get_eth_block_number(timestamp);

        let (slot, proof_sizes_bytes, proof_sizes_words, proofs_concat) = _decode_param_array(
            user_params
        );

        // Extract contract address and desired slot index
        assert(params.len() >= 2, 'SSP: Bad param length');
        let contract_address = *params.at(0);
        let slot_index = *params.at(1);

        // Ensure the slot proof is for the correct slot
        let valid_slot = get_slot_key(slot_index.into(), user.into());
        assert(slot.into() == valid_slot, 'SSP: Invalid slot');

        let facts_registry = IFactsRegistryDispatcher { contract_address: self._fact_registry.read() };
        let slot_value = facts_registry.get_storage_uint(
            eth_block_number - 1, // Shift by 1 due to Herodotus v1 offset.
            contract_address,
            slot,
            proof_sizes_bytes,
            proof_sizes_words,
            proofs_concat,
        );
        slot_value
    }

    /// Decodes the user params into the slot, proof sizes, and proofs.
    /// * `params` - The user params, containing the slot, proof sizes, and proofs.
    fn _decode_param_array(
        params: Span<felt252>
    ) -> (StorageSlot, Span::<felt252>, Span::<felt252>, Span::<felt252>) {
        assert(params.len() >= 5, 'SSP: Bad user param length');

        let slot = StorageSlot {
            word_1: *params.at(0),
            word_2: *params.at(1),
            word_3: *params.at(2),
            word_4: *params.at(3),
        };
        let num_nodes: u32 = (*params.at(4)).try_into().unwrap();

        let proof_sizes_bytes = params.slice(5, num_nodes);
        let proof_sizes_words = params.slice(5 + num_nodes, num_nodes);
        let proofs_concat = params.slice(5 + 2 * num_nodes, params.len() - 5 - 2 * num_nodes);
        return (slot, proof_sizes_bytes, proof_sizes_words, proofs_concat);
    }
}
