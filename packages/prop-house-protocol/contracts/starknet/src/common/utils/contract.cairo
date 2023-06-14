use starknet::contract_address_const;
use prop_house::common::registry::strategy::IStrategyRegistryDispatcher;
use prop_house::common::utils::traits::IRoundDependencyRegistryDispatcher;

/// Get the Strategy Registry contract dispatcher.
fn get_strategy_registry() -> IStrategyRegistryDispatcher {
    IStrategyRegistryDispatcher {
        contract_address: contract_address_const::<'STRATEGY_REGISTRY_ADDRESS'>(), 
    }
}

/// Get the Multi-Chain Round Dependency Registry contract dispatcher.
fn get_round_dependency_registry() -> IRoundDependencyRegistryDispatcher {
    IRoundDependencyRegistryDispatcher {
        contract_address: contract_address_const::<'ROUND_DEP_REGISTRY_ADDRESS'>(), 
    }
}
