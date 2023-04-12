use prop_house::common::lib::constants::UINT64_MAX;
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
        let word_1_shifted = self.word_1 * UINT64_MAX;
        let word_3_shifted = self.word_3 * UINT64_MAX;
        let low = (word_3_shifted + self.word_4).try_into().unwrap();
        let high = (word_1_shifted + self.word_2).try_into().unwrap();

        u256 { low: low, high: high,  }
    }
}

#[abi]
trait IFactsRegistry {
    #[external]
    fn get_storage_uint(
        block: felt252,
        account_160: felt252,
        slot: StorageSlot,
        proof_sizes_bytes: Array<felt252>,
        proof_sizes_words: Array<felt252>,
        proofs_concat: Array<felt252>,
    ) -> u256;
}

#[contract]
mod EthereumBalanceOfVotingStrategy {
    use starknet::ContractAddress;
    use starknet::ContractAddressIntoFelt252;
    use prop_house::common::lib::u256::U256Zeroable;
    use prop_house::common::lib::traits::IVotingStrategy;
    use prop_house::common::lib::array_utils::array_slice;
    use prop_house::common::lib::storage_utils::get_slot_key;
    use prop_house::common::registry::ethereum_block::IEthereumBlockRegistryDispatcherTrait;
    use prop_house::common::registry::ethereum_block::IEthereumBlockRegistryDispatcher;
    use super::IFactsRegistryDispatcherTrait;
    use super::IFactsRegistryDispatcher;
    use super::StorageSlotIntoU256;
    use super::StorageSlot;
    use option::OptionTrait;
    use zeroable::Zeroable;
    use array::ArrayTrait;
    use traits::TryInto;
    use traits::Into;

    struct Storage {
        _fact_registry: ContractAddress,
        _ethereum_block_registry: ContractAddress,
    }

    impl EthereumBalanceOfVotingStrategy of IVotingStrategy {
        fn get_voting_power(
            timestamp: u32,
            voter_address: ContractAddress,
            params: Array<felt252>,
            user_params: Array<felt252>,
        ) -> u256 {
            let params_len = params.len();

            // Expects contract_address slot_index, with an optional voting_power_multiplier
            assert(params_len == 2 | params_len == 3, 'EthereumBO: Bad param length');

            let voting_power = _get_slot_value(timestamp, voter_address, @params, user_params);
            if params_len == 2 {
                return voting_power;
            }

            let voting_power_multiplier = *params.at(2);
            assert(voting_power_multiplier.is_non_zero(), 'EthereumBO: Invalid multiplier');

            voting_power * voting_power_multiplier.into()
        }
    }

    #[constructor]
    fn constructor(fact_registry: ContractAddress, ethereum_block_registry: ContractAddress) {
        initializer(fact_registry, ethereum_block_registry);
    }

    /// Returns the voting power of the voter at the given timestamp.
    #[external]
    fn get_voting_power(
        timestamp: u32,
        voter_address: ContractAddress,
        params: Array<felt252>,
        user_params: Array<felt252>,
    ) -> u256 {
        EthereumBalanceOfVotingStrategy::get_voting_power(
            timestamp, voter_address, params, user_params
        )
    }

    ///
    /// Internals
    ///

    /// Initializes the contract.
    fn initializer(fact_registry_: ContractAddress, ethereum_block_registry_: ContractAddress) {
        _fact_registry::write(fact_registry_);
        _ethereum_block_registry::write(ethereum_block_registry_);
    }

    /// Returns the value of the mapping storage slot at the given timestamp.
    fn _get_slot_value(
        timestamp: u32,
        voter_address: ContractAddress,
        params: @Array<felt252>,
        user_params: Array<felt252>,
    ) -> u256 {
        let ethereum_block_registry = IEthereumBlockRegistryDispatcher {
            contract_address: _ethereum_block_registry::read()
        };
        let eth_block_number = ethereum_block_registry.get_eth_block_number(timestamp.into());

        let (slot, proof_sizes_bytes, proof_sizes_words, proofs_concat) = _decode_param_array(
            user_params
        );

        // Extract contract address and desired slot index
        assert(params.len() == 2, 'SSP: Invalid param length');
        let contract_address = *params.at(0);
        let slot_index = *params.at(1);

        // Ensure the slot proof is for the correct slot
        let valid_slot = get_slot_key(slot_index, voter_address.into());
        assert(slot.into() == valid_slot, 'SingleSlotProof: Invalid slot');

        let facts_registry = IFactsRegistryDispatcher { contract_address: _fact_registry::read() };
        let slot_value = facts_registry.get_storage_uint(
            eth_block_number,
            contract_address,
            slot,
            proof_sizes_bytes,
            proof_sizes_words,
            proofs_concat,
        );
        assert(slot_value.is_non_zero(), 'SSP: Slot value is zero');

        slot_value
    }

    /// Decodes the user params into the slot, proof sizes, and proofs.
    fn _decode_param_array(
        params: Array<felt252>
    ) -> (StorageSlot, Array::<felt252>, Array::<felt252>, Array::<felt252>) {
        assert(params.len() >= 5, 'SSP: Invalid user param length');

        let slot = StorageSlot {
            word_1: *params.at(0),
            word_2: *params.at(1),
            word_3: *params.at(2),
            word_4: *params.at(3),
        };
        let num_nodes: u32 = (*params.at(4)).try_into().unwrap();

        let proof_sizes_bytes = array_slice(@params, 5, num_nodes);
        let proof_sizes_words = array_slice(@params, 5 + num_nodes, num_nodes);
        let proofs_concat = array_slice(
            @params, 5 + 2 * num_nodes, params.len() - 5 - 2 * num_nodes
        );
        return (slot, proof_sizes_bytes, proof_sizes_words, proofs_concat);
    }
}
