#[contract]
mod Ownable {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use zeroable::Zeroable;

    struct Storage {
        _owner: ContractAddress
    }

    #[event]
    fn OwnershipTransferred(previous_owner: ContractAddress, new_owner: ContractAddress) {}

    /// Initializes the contract, setting the caller (deployer) as the initial owner.
    fn initializer() {
        let caller = get_caller_address();
        _transfer_ownership(caller);
    }

    /// Returns the current owner.
    fn owner() -> ContractAddress {
        _owner::read()
    }

    /// Throws if called by any account other than the owner.
    fn assert_only_owner() {
        let owner = _owner::read();
        let caller = get_caller_address();
        assert(!caller.is_zero(), 'Caller is the zero address');
        assert(caller == owner, 'Caller is not the owner');
    }

    /// Transfers ownership of the contract to a new account (`new_owner`).
    /// * `new_owner` - The address to transfer ownership to.
    fn transfer_ownership(new_owner: ContractAddress) {
        assert(!new_owner.is_zero(), 'New owner is the zero address');
        assert_only_owner();
        _transfer_ownership(new_owner);
    }

    /// Renounces ownership of the contract, leaving it without an owner.
    fn renounce_ownership() {
        assert_only_owner();
        _transfer_ownership(Zeroable::zero());
    }

    /// Internal function to transfer ownership of the contract to a new account (`new_owner`).
    /// * `new_owner` - The address to transfer ownership to.
    fn _transfer_ownership(new_owner: ContractAddress) {
        let previous_owner = _owner::read();
        _owner::write(new_owner);

        OwnershipTransferred(previous_owner, new_owner);
    }
}
