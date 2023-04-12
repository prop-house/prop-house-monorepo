#[abi]
trait IL1HeadersStore {
    #[external]
    fn get_latest_l1_block() -> felt252;
}

#[abi]
trait IEthereumBlockRegistry {
    #[external]
    fn get_eth_block_number(timestamp: felt252) -> felt252;
}

#[contract]
mod EthereumBlockRegistry {
    use starknet::ContractAddress;
    use super::IEthereumBlockRegistry;
    use super::IL1HeadersStoreDispatcherTrait;
    use super::IL1HeadersStoreDispatcher;
    use zeroable::Zeroable;

    struct Storage {
        _l1_headers_store: ContractAddress,
        _timestamp_to_eth_block_number: LegacyMap<felt252, felt252>,
    }

    impl EthereumBlockRegistry of IEthereumBlockRegistry {
        fn get_eth_block_number(timestamp: felt252) -> felt252 {
            let number = _timestamp_to_eth_block_number::read(timestamp);
            if number.is_non_zero() {
                // The timestamp has already be queried in herodotus and stored. Therefore we can just return the stored value
                // This branch will be taken whenever a vote is cast as the mapping value would be set at proposal creation.
                number
            } else {
                // The timestamp has not yet been queried in herodotus. Therefore we must query Herodotus for the latest eth block
                // number stored there and store it here in the mapping indexed by the timestamp provided.
                // This branch will be taken whenever a proposal is created, except for the (rare) case of multiple proposals
                // being created in the same block.
                let number = IL1HeadersStoreDispatcher {
                    contract_address: _l1_headers_store::read()
                }.get_latest_l1_block();
                _timestamp_to_eth_block_number::write(timestamp, number);
                number
            }
        }
    }

    #[constructor]
    fn constructor(l1_headers_store: ContractAddress) {
        initializer(l1_headers_store);
    }

    /// Returns the closest ethereum block number for the given timestamp.
    #[external]
    fn get_eth_block_number(timestamp: felt252) -> felt252 {
        EthereumBlockRegistry::get_eth_block_number(timestamp)
    }

    ///
    /// Internals
    ///

    /// Initializes the contract.
    fn initializer(l1_headers_store_: ContractAddress) {
        _l1_headers_store::write(l1_headers_store_);
    }
}
