use prop_house::common::registry::ethereum_block::EthereumBlockRegistry;

#[test]
#[available_gas(100000000)]
#[should_panic(expected: ('EBR: Cannot query the future', ))]
fn test_ethereum_block_registry_query_future_failure() {
    let mut ebr_state = EthereumBlockRegistry::unsafe_new_contract_state();
    EthereumBlockRegistry::EthereumBlockRegistry::get_eth_block_number(
        ref ebr_state, 99999999999,
    );
}
