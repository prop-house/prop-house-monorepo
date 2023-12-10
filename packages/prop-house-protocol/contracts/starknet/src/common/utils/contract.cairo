use starknet::contract_address_const;
use prop_house::common::registry::strategy::IStrategyRegistryDispatcher;
use prop_house::common::utils::traits::IRoundDependencyRegistryDispatcher;

/// Get the Strategy Registry contract dispatcher.
/// `STRATEGY_REGISTRY_ADDRESS` is a deployment-time constant
/// that's dynamically populated.
fn get_strategy_registry() -> IStrategyRegistryDispatcher {
    IStrategyRegistryDispatcher {
        contract_address: contract_address_const::<'STRATEGY_REGISTRY_ADDRESS'>(), 
    }
}

/// Get the Multi-Chain Round Dependency Registry contract dispatcher.
/// `ROUND_DEP_REGISTRY_ADDRESS` is a deployment-time constant
/// that's dynamically populated.
fn get_round_dependency_registry() -> IRoundDependencyRegistryDispatcher {
    IRoundDependencyRegistryDispatcher {
        contract_address: contract_address_const::<'ROUND_DEP_REGISTRY_ADDRESS'>(), 
    }
}
