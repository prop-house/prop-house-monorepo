use starknet::ContractAddress;

#[abi]
trait IEthereumTxAuthStrategy {
    fn authenticate(target: ContractAddress, selector: felt252, cdata: Span<felt252>);
}

#[contract]
mod EthereumTxAuthStrategy {
    use starknet::{ContractAddress, ContractAddressIntoFelt252, call_contract_syscall};
    use prop_house::common::utils::hash::compute_hash_on_elements;
    use prop_house::common::utils::array::ArrayTraitExt;
    use prop_house::common::utils::serde::SpanSerde;
    use super::IEthereumTxAuthStrategy;
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _commit_address: ContractAddress,
        _commits: LegacyMap<felt252, felt252>,
    }

    impl EthereumTxAuthStrategy of IEthereumTxAuthStrategy {
        fn authenticate(target: ContractAddress, selector: felt252, cdata: Span<felt252>) {
            let mut input = Default::default();
            input.append(target.into());
            input.append(selector);
            input.append_all(cdata);

            // Check that the hash matches a commit and that the commit was created by the correct address
            _consume_commit(*cdata.at(0), compute_hash_on_elements(input.span()));

            // Execute the function call with the supplied calldata
            starknet::call_contract_syscall(
                address: target, entry_point_selector: selector, calldata: cdata, 
            )
            .unwrap_syscall();
        }
    }

    #[constructor]
    fn constructor(commit_address: ContractAddress) {
        initializer(commit_address);
    }

    /// Authenticates a function call using a commit from Ethereum.
    /// * `target` - The address of the contract to call.
    /// * `selector` - The selector of the function to call.
    /// * `cdata` - The calldata to pass to the function.
    #[external]
    fn authenticate(target: ContractAddress, selector: felt252, cdata: Span<felt252>) {
        EthereumTxAuthStrategy::authenticate(target, selector, cdata);
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `hash` - The commit hash.
    #[l1_handler]
    fn commit(from_address: felt252, sender: felt252, hash: felt252) {
        _only_commit_address(from_address);

        // If the same hash is committed twice by the same sender,
        // then the mapping will be overwritten but with the same value as before.
        _commits::write(hash, sender);
    }

    ///
    /// Internals
    ///

    /// Initializes the contract.
    fn initializer(commit_address_: ContractAddress) {
        _commit_address::write(commit_address_);
    }

    /// Consumes a commit from Ethereum.
    /// * `sender_` - The sender of the commit on L1.
    /// * `hash_` - The commit hash.
    fn _consume_commit(sender_: felt252, hash_: felt252) {
        let stored_address = _commits::read(hash_);

        // Check that the hash has been received from the commit contract
        // The hash is unknown if not yet committed or already executed
        assert(stored_address.is_non_zero(), 'EthereumTx: Unknown hash');

        // The sender of the commit on L1 must be the same as the address in the calldata
        assert(sender_ == stored_address, 'EthereumTx: Invalid committer');

        _commits::write(hash_, 0);
    }

    /// Checks that `from_address_` is the commit address.
    /// * `from_address_` - The address from which the L1 message was sent.
    fn _only_commit_address(from_address_: felt252) {
        let commit_address = _commit_address::read();
        assert(from_address_ == commit_address.into(), 'EthereumTx: Not commit address');
    }
}
