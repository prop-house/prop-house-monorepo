use prop_house::common::registry::ethereum_block::EthereumBlockRegistry;

#[test]
#[available_gas(100000000)]
#[should_panic(expected: ('EBR: Cannot query the future', ))]
fn test_ethereum_block_registry_query_future_failure() {
    EthereumBlockRegistry::get_eth_block_number(99999999999);
}
