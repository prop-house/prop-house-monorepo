/// Timed funding round function selectors
mod Selector {
    /// The selector of the propose function.
    const PROPOSE: felt252 = 0x1bfd596ae442867ef71ca523061610682af8b00fc2738329422f4ad8d220b81;

    /// The selector of the vote function.
    const VOTE: felt252 = 0x132bdf85fc8aa10ac3c22f02317f8f53d4b4f52235ed1eabb3a4cbbe08b5c41;

    /// The selector of the proposal cancellation function.
    const CANCEL_PROPOSAL: felt252 = 0xf58b7fa5874c036308bea0b54ae78e8ecf78d868aa18e666aa7fc4e0cbed6d;
}

/// EIP-712 domain separator hashes
mod DomainSeparator {
    use prop_house::common::utils::u256::as_u256;

    /// name: 'prop-house',
    /// version: '1'
    /// chainId: '5'
    const GOERLI_HIGH: u128 = 0x367959fbff4da0a038f30383de089bcd;
    const GOERLI_LOW: u128 = 0x293b7960f35bd1db59a620d4c2cbfd81;

    /// Returns the domain separator hash for the Goerli testnet.
    /// `u256` literals are not yet supported.
    fn GOERLI() -> u256 {
        as_u256(GOERLI_HIGH, GOERLI_LOW)
    }
}

/// Timed funding round EIP-712 type hashes used for authentication
mod TypeHash {
    use prop_house::common::utils::u256::as_u256;

    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposerAddress,string metadataUri,uint256 salt)")
    const PROPOSE_HIGH: u128 = 0x782C7E7AEB98C20F9395BFDB9030A3D6;
    const PROPOSE_LOW: u128 = 0xBBCE0E74657DEA727DF7F4E40F37E44C;

    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voterAddress,bytes32 proposalVotesHash,bytes32 votingStrategiesHash,bytes32 votingStrategyParamsHash,uint256 salt)")
    const VOTE_HIGH: u128 = 0xFA0DEBB52364E16244B35664AFCE7152;
    const VOTE_LOW: u128 = 0x479E5AE09EA00CE01036179CC073A2C7;

    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint256 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL_HIGH: u128 = 0x171B70688E107ED47A5AB51E3CF4A20E;
    const CANCEL_PROPOSAL_LOW: u128 = 0x11FB0CEB275F51F3B1469D5DA7B6D7D4;

    /// Returns the type hash for the propose function.
    /// `u256` literals are not yet supported.
    fn PROPOSE() -> u256 {
        as_u256(PROPOSE_HIGH, PROPOSE_LOW)
    }

    /// Returns the type hash for the vote function.
    /// `u256` literals are not yet supported.
    fn VOTE() -> u256 {
        as_u256(VOTE_HIGH, VOTE_LOW)
    }

    /// Returns the type hash for the proposal cancellation function.
    /// `u256` literals are not yet supported.
    fn CANCEL_PROPOSAL() -> u256 {
        as_u256(CANCEL_PROPOSAL_HIGH, CANCEL_PROPOSAL_LOW)
    }
}
