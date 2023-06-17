#[contract]
mod EthereumCommitInbox {
    use starknet::{ContractAddress, ContractAddressIntoFelt252};
    use prop_house::common::utils::traits::IEthereumCommitInbox;
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _commit_address: ContractAddress,
        _commit_exists: LegacyMap<(felt252, felt252), bool>,
    }

    impl EthereumCommitInbox of IEthereumCommitInbox {
        fn commit_exists(sender: felt252, commit_hash: felt252) -> bool {
            _commit_exists::read((sender, commit_hash))
        }
    }

    #[constructor]
    fn constructor(commit_address: ContractAddress) {
        initializer(commit_address);
    }

    /// Returns a boolean indicating whether a commit exists by the provided sender.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    #[view]
    fn commit_exists(sender: felt252, commit_hash: felt252) -> bool {
        EthereumCommitInbox::commit_exists(sender, commit_hash)
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    #[l1_handler]
    fn commit(from_address: felt252, sender: felt252, commit_hash: felt252) {
        _only_commit_address(from_address);

        // If the same hash is committed twice by the same sender,
        // then the mapping will be overwritten with the same value as before.
        _commit_exists::write((sender, commit_hash), true);
    }

    ///
    /// Internals
    ///

    /// Initializes the contract.
    fn initializer(commit_address_: ContractAddress) {
        _commit_address::write(commit_address_);
    }

    /// Checks that `from_address_` is the commit address.
    /// * `from_address_` - The address from which the L1 message was sent.
    fn _only_commit_address(from_address_: felt252) {
        let commit_address = _commit_address::read();
        assert(from_address_ == commit_address.into(), 'EthereumTx: Not commit address');
    }
}
