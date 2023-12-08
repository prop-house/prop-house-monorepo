#[starknet::contract]
mod Ownable {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use zeroable::Zeroable;

    #[storage]
    struct Storage {
        _owner: ContractAddress
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnershipTransferred: OwnershipTransferred,
    }

    /// Event emitted when ownership of the contract is transferred.
    /// * `previous_owner` - The address of the previous owner.
    /// * `new_owner` - The address of the new owner.
    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress, new_owner: ContractAddress
    }

    /// Initializes the contract, transferring ownership to the provided address.
    /// * `initial_owner` - The address to transfer ownership to.
    fn initializer(ref self: ContractState, initial_owner: ContractAddress) {
        assert(initial_owner.is_non_zero(), 'Owner is the zero address');
        _transfer_ownership(ref self, initial_owner);
    }

    /// Returns the current owner.
    fn owner(self: @ContractState) -> ContractAddress {
        self._owner.read()
    }

    /// Throws if called by any account other than the owner.
    fn assert_only_owner(self: @ContractState) {
        let owner = self._owner.read();
        let caller = get_caller_address();
        assert(caller.is_non_zero(), 'Caller is the zero address');
        assert(caller == owner, 'Caller is not the owner');
    }

    /// Transfers ownership of the contract to a new account (`new_owner`).
    /// * `new_owner` - The address to transfer ownership to.
    fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
        assert(new_owner.is_non_zero(), 'New owner is the zero address');
        assert_only_owner(@self);
        _transfer_ownership(ref self, new_owner);
    }

    /// Renounces ownership of the contract, leaving it without an owner.
    fn renounce_ownership(ref self: ContractState) {
        assert_only_owner(@self);
        _transfer_ownership(ref self, Zeroable::zero());
    }

    /// Internal function to transfer ownership of the contract to a new account (`new_owner`).
    /// * `new_owner` - The address to transfer ownership to.
    fn _transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
        let previous_owner = self._owner.read();
        self._owner.write(new_owner);

        self.emit(
            Event::OwnershipTransferred(OwnershipTransferred { previous_owner, new_owner }),
        );
    }
}
