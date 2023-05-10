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
    /// The domain separator hash for the Goerli testnet.
    /// name: 'prop-house',
    /// version: '1'
    /// chainId: '5'
    const GOERLI: u256 = 0x367959fbff4da0a038f30383de089bcd293b7960f35bd1db59a620d4c2cbfd81;
}

/// Timed funding round EIP-712 type hashes used for authentication
mod TypeHash {
    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposerAddress,string metadataUri,uint256 salt)")
    const PROPOSE: u256 = 0x782c7e7aeb98c20f9395bfdb9030a3d6bbce0e74657dea727df7f4e40f37e44c;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voterAddress,bytes32 proposalVotesHash,bytes32 votingStrategiesHash,bytes32 votingStrategyParamsHash,uint256 salt)")
    const VOTE: u256 = 0xfa0debb52364e16244b35664afce7152479e5ae09ea00ce01036179cc073a2c7;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint256 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0x171b70688e107ed47a5ab51e3cf4a20e11fb0ceb275f51f3b1469d5da7b6d7d4;
}
