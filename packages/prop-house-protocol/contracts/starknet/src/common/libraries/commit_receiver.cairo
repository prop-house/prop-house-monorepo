#[contract]
mod CommitReceiver {
    use starknet::{ContractAddress, ContractAddressIntoFelt252};
    use zeroable::Zeroable;
    use traits::Into;

    struct Storage {
        _commit_address: ContractAddress,
        _commit_exists: LegacyMap<(felt252, felt252), bool>,
    }

    /// Initializes the contract by setting the commit address.
    fn initializer(commit_address: ContractAddress) {
        _commit_address::write(commit_address);
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    fn commit(from_address: felt252, sender: felt252, commit_hash: felt252) {
        _only_commit_address(from_address);

        // If the same hash is committed twice by the same sender,
        // then the mapping will be overwritten with the same value as before.
        _commit_exists::write((sender, commit_hash), true);
    }

    /// Consumes a commit from Ethereum.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    fn consume_commit(sender: felt252, commit_hash: felt252) {
        // Assert that the hash has been received from the commit contract by the sender
        // The hash is unknown if not yet committed or already executed
        assert(_commit_exists::read((sender, commit_hash)), 'EthereumTx: Unknown sender/hash');

        _commit_exists::write((sender, commit_hash), false);
    }

    /// Checks that `from_address_` is the commit address.
    /// * `from_address_` - The address from which the L1 message was sent.
    fn _only_commit_address(from_address_: felt252) {
        let commit_address = _commit_address::read();
        assert(from_address_ == commit_address.into(), 'EthereumTx: Not commit address');
    }
}
