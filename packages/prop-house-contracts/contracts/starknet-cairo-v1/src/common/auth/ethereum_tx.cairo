#[contract]
mod EthereumTxAuthStrategy {
    use starknet::{ContractAddress, ContractAddressIntoFelt252, call_contract_syscall };
    use prop_house::common::utils::array::{array_hash, ArrayTraitExt };
    use prop_house::common::utils::traits::IAuthStrategy;
    use zeroable::Zeroable;
    use array::ArrayTrait;
    use traits::Into;

    struct Storage {
        _commit_address: ContractAddress,
        _commits: LegacyMap<felt252, felt252>,
    }

    impl EthereumTxAuthStrategy of IAuthStrategy {
        fn authenticate(target: ContractAddress, selector: felt252, mut cdata: Array<felt252>) {
            let mut input = ArrayTrait::new();
            input.append(target.into());
            input.append(selector);
            input.append_all(ref cdata);

            // Check that the hash matches a commit and that the commit was created by the correct address
            _consume_commit(*cdata.at(0), array_hash(@input));

            // Execute the function call with the supplied calldata
            starknet::call_contract_syscall(
                address: target, entry_point_selector: selector, calldata: cdata.span(), 
            ).unwrap_syscall();
        }
    }

    #[constructor]
    fn constructor(commit_address: ContractAddress) {
        initializer(commit_address);
    }

    #[external]
    fn authenticate(target: ContractAddress, selector: felt252, cdata: Array<felt252>) {
        EthereumTxAuthStrategy::authenticate(target, selector, cdata);
    }

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

    fn _consume_commit(sender_: felt252, hash_: felt252) {
        let stored_address = _commits::read(hash_);

        // Check that the hash has been received from the commit contract
        // The hash is unknown if not yet committed or already executed
        assert(stored_address.is_non_zero(), 'EthereumTx: Unknown hash');

        // The sender of the commit on L1 must be the same as the address in the calldata
        assert(sender_ == stored_address, 'EthereumTx: Invalid committer');

        _commits::write(hash_, 0);
    }

    fn _only_commit_address(from_address_: felt252) {
        let commit_address = _commit_address::read();
        assert(from_address_ == commit_address.into(), 'EthereumTx: Not commit address');
    }
}
