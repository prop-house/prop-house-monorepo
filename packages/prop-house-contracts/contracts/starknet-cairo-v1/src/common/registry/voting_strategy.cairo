use starknet::StorageAccess;
use starknet::SyscallResult;
use starknet::StorageBaseAddress;
use starknet::storage_read_syscall;
use starknet::storage_write_syscall;
use starknet::storage_address_from_base_and_offset;
use starknet::contract_address::Felt252TryIntoContractAddress;
use starknet::ContractAddressIntoFelt252;
use starknet::ContractAddress;
use option::OptionTrait;
use traits::TryInto;
use traits::Into;
use clone::Clone;

#[derive(Clone, Drop, Serde)]
struct VotingStrategy {
    address: ContractAddress,
    params: Array<felt252>,
}

impl VotingStrategyStorageAccess of StorageAccess<VotingStrategy> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<VotingStrategy> {
        Result::Ok(
            VotingStrategy {
                address: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 0)
                )?.try_into().unwrap(),
                params: ArrayTrait::new(),
            // TODO: Arrays do not yet implement `StorageAccess`
            // params: storage_read_syscall(
            //     address_domain,
            //     storage_address_from_base_and_offset(base, 1)
            // )?.try_into().unwrap(),
            }
        )
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, value: VotingStrategy
    ) -> SyscallResult<()> {
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0), value.address.into()
        ) // ?;
    // TODO: Arrays do not yet implement `StorageAccess` 
    // storage_write_syscall(
    //     address_domain,
    //     storage_address_from_base_and_offset(base, 1_u8),
    //     value.params.into()
    // )
    }
}

#[abi]
trait IVotingStrategyRegistry {
    fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy;
    fn register_voting_strategy_if_not_exists(voting_strategy: VotingStrategy) -> felt252;
}

#[contract]
mod VotingStrategyRegistry {
    use starknet::ContractAddress;
    use starknet::ContractAddressIntoFelt252;
    use starknet::contract_address::ContractAddressZeroable;
    use prop_house::common::utils::array::ArrayTraitExt;
    use prop_house::common::utils::array::array_hash;
    use super::IVotingStrategyRegistry;
    use super::VotingStrategy;
    use array::ArrayTCloneImpl;
    use zeroable::Zeroable;
    use array::ArrayTrait;
    use traits::Into;
    use clone::Clone;

    struct Storage {
        _voting_strategies: LegacyMap<felt252, VotingStrategy>, 
    }

    #[event]
    fn VotingStrategyRegistered(strategy_id: felt252, strategy: VotingStrategy) {}

    impl VotingStrategyRegistry of IVotingStrategyRegistry {
        fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy {
            let voting_strategy = _voting_strategies::read(strategy_id);
            assert(voting_strategy.address.is_non_zero(), 'VSR: Strategy does not exist');

            voting_strategy
        }

        fn register_voting_strategy_if_not_exists(mut voting_strategy: VotingStrategy) -> felt252 {
            let strategy_id = _compute_strategy_id(ref voting_strategy);

            let stored_strategy = _voting_strategies::read(strategy_id);
            if stored_strategy.address.is_zero() {
                let s = @voting_strategy;

                _voting_strategies::write(strategy_id, voting_strategy);
                VotingStrategyRegistered(
                    strategy_id, VotingStrategy { address: *s.address, params: s.params.clone(),  }
                );
            }
            strategy_id
        }
    }

    /// Returns the voting strategy for the given strategy id.
    /// * `strategy_id` - The strategy id.
    #[view]
    fn get_voting_strategy(strategy_id: felt252) -> VotingStrategy {
        VotingStrategyRegistry::get_voting_strategy(strategy_id)
    }

    /// Registers the given voting strategy if it does not exist.
    /// * `voting_strategy` - The voting strategy.
    #[external]
    fn register_voting_strategy_if_not_exists(voting_strategy: VotingStrategy) -> felt252 {
        VotingStrategyRegistry::register_voting_strategy_if_not_exists(voting_strategy)
    }

    ///
    /// Internals
    ///

    /// Computes the strategy id for the given voting strategy.
    /// * `voting_strategy` - The voting strategy.
    fn _compute_strategy_id(ref voting_strategy: VotingStrategy) -> felt252 {
        let mut strategy_array = ArrayTrait::new();
        strategy_array.append(voting_strategy.address.into());
        strategy_array.append_all(ref voting_strategy.params);

        array_hash(@strategy_array)
    }
}
