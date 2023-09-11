#[starknet::contract]
mod CommitReceiver {
    use starknet::EthAddress;

    #[storage]
    struct Storage {
        _commit_address: felt252,
        _commit_exists: LegacyMap<(felt252, felt252), bool>,
    }

    /// Initializes the contract by setting the commit address.
    /// * `commit_address` - The address of the commit contract.
    fn initializer(ref self: ContractState, commit_address: EthAddress) {
        self._commit_address.write(commit_address.address);
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    fn commit(ref self: ContractState, from_address: felt252, sender: felt252, commit_hash: felt252) {
        _only_commit_address(@self, from_address);

        // If the same hash is committed twice by the same sender,
        // then the mapping will be overwritten with the same value as before.
        self._commit_exists.write((sender, commit_hash), true);
    }

    /// Consumes a commit from Ethereum.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    fn consume_commit(ref self: ContractState, sender: felt252, commit_hash: felt252) {
        // Assert that the hash has been received from the commit contract by the sender
        // The hash is unknown if not yet committed or already executed
        assert(self._commit_exists.read((sender, commit_hash)), 'EthereumTx: Unknown sender/hash');

        self._commit_exists.write((sender, commit_hash), false);
    }

    /// Checks that `from_address_` is the commit address.
    /// * `from_address_` - The address from which the L1 message was sent.
    fn _only_commit_address(self: @ContractState, from_address_: felt252) {
        let commit_address = self._commit_address.read();
        assert(from_address_ == commit_address, 'EthereumTx: Not commit address');
    }
}
